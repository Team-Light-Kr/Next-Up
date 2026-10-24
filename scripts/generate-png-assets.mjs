import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="160" y1="120" x2="380" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Base Rounded Container -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect x="2" y="2" width="508" height="508" rx="110" stroke="#1e293b" stroke-width="4"/>

  <!-- Left Stem (White/Slate Crisp) -->
  <path d="M144 384V148C144 139.163 151.163 132 160 132H168C176.837 132 184 139.163 184 148V384H144Z" fill="#F8FAFC" filter="url(#subtleShadow)"/>

  <!-- Dynamic Diagonal (Royal Blue) -->
  <path d="M168 140L348 372H320L148 152H168Z" fill="url(#blueGrad)"/>

  <!-- Right Stem (Royal Blue with Upward Arrow) -->
  <path d="M328 384V200C328 191.163 335.163 184 344 184H352C360.837 184 368 191.163 368 200V384H328Z" fill="url(#blueGrad)" filter="url(#subtleShadow)"/>

  <!-- Crisp Upward Chevron Indicator on Right -->
  <path d="M308 148L352 104L396 148" stroke="url(#blueGrad)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Save updated SVG
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent, 'utf-8');

  // 2. Generate 512x512 PNG Logo
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Created public/logo.png (512x512)');

  // 3. Generate 192x192 PNG Logo for manifest / headers
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'logo-192.png'));
  console.log('✓ Created public/logo-192.png (192x192)');

  // 4. Generate 64x64 PNG Favicon
  await sharp(Buffer.from(svgContent))
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Created public/favicon.png (64x64)');

  // 5. Generate 32x32 PNG Favicon as favicon.ico
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created public/favicon.ico (32x32)');
}

main().catch(console.error);
