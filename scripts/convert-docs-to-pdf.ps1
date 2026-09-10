# Convertit tous les .doc/.docx du dossier public/docs/ en PDF via Word COM.
# Le layout original est parfaitement préservé (formulaires, tableaux, etc.).
#
# Usage : lancer depuis la racine du projet
#   powershell -ExecutionPolicy Bypass -File scripts/convert-docs-to-pdf.ps1

$ErrorActionPreference = 'Stop'

$docsDir = Join-Path $PSScriptRoot '..\public\docs'
$docsDir = (Resolve-Path $docsDir).Path

Write-Host "Dossier source : $docsDir"

$sources = Get-ChildItem -Path $docsDir -File | Where-Object { $_.Extension -in '.doc', '.docx' }
if (-not $sources) {
  Write-Host 'Aucun .doc/.docx à convertir.'
  exit 0
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0  # wdAlertsNone

try {
  foreach ($src in $sources) {
    $pdfPath = [System.IO.Path]::ChangeExtension($src.FullName, '.pdf')
    Write-Host "→ $($src.Name) → $(Split-Path -Leaf $pdfPath)"

    $doc = $word.Documents.Open($src.FullName, $false, $true)  # ReadOnly:true
    try {
      # 17 = wdFormatPDF
      $doc.SaveAs([ref] $pdfPath, [ref] 17)
    } finally {
      $doc.Close($false)
    }
  }
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

# Suppression des .doc/.docx d'origine une fois convertis
foreach ($src in $sources) {
  Remove-Item -Path $src.FullName -Force
  Write-Host "Supprimé : $($src.Name)"
}

Write-Host "`nConversion terminée."
