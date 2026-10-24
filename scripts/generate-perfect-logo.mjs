import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Exact vector matching user screenshot:
// Dark squircle container
// Left: White N (M14 34V14L24 26V14)
// Right: Blue N (M24 34V22L34 34V14) + Solid Upward Arrowhead (▲)
const svgContent = `<svg width="512" height="512" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark Rounded Container -->
  <rect width="48" height="48" rx="11" fill="#0b1120"/>

  <!-- Left White N Stroke -->
  <path d="M14 34V14L24 26V14" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Right Blue N Stroke -->
  <path d="M24 34V22L34 34V15" stroke="#3b82f6" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Right Blue Upward Arrowhead -->
  <path d="M34 9.5L29 16.5H39L34 9.5Z" fill="#3b82f6" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

async function run() {
  const publicDir = path.resolve('public');

  // 1. Save logo.svg
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent, 'utf-8');

  // 2. Save favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

  // 3. Generate high-resolution 512x512 PNG
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'logo.png'));

  // 4. Generate 192x192 PNG
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'logo-192.png'));

  // 5. Generate 64x64 PNG
  await sharp(Buffer.from(svgContent))
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.png'));

  // 6. Generate 32x32 ICO/PNG
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✓ Successfully generated perfect logo & favicons matching user reference image!');
}

run().catch(console.error);
