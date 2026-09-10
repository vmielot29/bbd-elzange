#!/usr/bin/env node
/**
 * BBD Elzange — Utilitaire de traitement du logo
 *
 * Le nouveau logo est un écusson circulaire sur fond clair (textures, grain).
 * Ce script :
 *   1. Lit le fichier source (n'importe quel format : PNG, JPG, WEBP).
 *   2. Le redimensionne à 1024×1024 max (largement suffisant pour le web).
 *   3. Applique un masque circulaire pour rendre TOUT ce qui est en dehors
 *      du cercle inscrit transparent — propre et sans flood-fill hasardeux.
 *   4. Écrit le PNG final dans `public/img/ecusson-club.png` (où le site le
 *      référence déjà).
 *
 * Usage :
 *   node scripts/process-logo.mjs ./chemin/vers/nouveau-logo.png
 *
 * NOTE : si ton logo n'est PAS strictement circulaire (par ex. carré avec
 * coins arrondis), tu peux désactiver le masque en passant --no-mask :
 *   node scripts/process-logo.mjs ./logo.png --no-mask
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const args = process.argv.slice(2);
const noMask = args.includes('--no-mask');
const inputPath = args.find((a) => !a.startsWith('--'));

if (!inputPath) {
  console.error('Usage : node scripts/process-logo.mjs <fichier-source> [--no-mask]');
  process.exit(1);
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(projectRoot, 'public', 'img', 'ecusson-club.png');

async function run() {
  const absolute = path.resolve(inputPath);
  await fs.access(absolute).catch(() => {
    console.error(`✖ Fichier introuvable : ${absolute}`);
    process.exit(1);
  });

  const TARGET = 1024;

  // 1. Resize en gardant le ratio + canvas carré transparent
  let pipeline = sharp(absolute)
    .resize(TARGET, TARGET, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha();

  if (!noMask) {
    // 2. Masque circulaire SVG (cercle inscrit dans le carré)
    const svgMask = Buffer.from(
      `<svg width="${TARGET}" height="${TARGET}" xmlns="http://www.w3.org/2000/svg">` +
        `<circle cx="${TARGET / 2}" cy="${TARGET / 2}" r="${TARGET / 2}" fill="white"/>` +
      `</svg>`,
    );
    pipeline = pipeline.composite([{ input: svgMask, blend: 'dest-in' }]);
  }

  await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
  const stat = await fs.stat(outputPath);
  console.log(`✔ Logo écrit : ${outputPath}`);
  console.log(`  taille : ${(stat.size / 1024).toFixed(1)} kB — ${TARGET}×${TARGET}`);
  if (noMask) console.log('  masque circulaire désactivé.');
}

run().catch((err) => {
  console.error('✖ Erreur :', err.message);
  process.exit(1);
});
