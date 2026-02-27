import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'pistaches-logo.svg');
const publicDir = join(root, 'public');

const svg = readFileSync(svgPath);

async function generateIcons() {
  for (const size of [192, 512]) {
    const png = await sharp(svg)
      .resize(size, size)
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, `icon-${size}x${size}.png`), png);
    console.log(`Generated icon-${size}x${size}.png`);
  }
  // Favicon 32x32
  const favicon = await sharp(svg)
    .resize(32, 32)
    .png()
    .toBuffer();
  writeFileSync(join(root, 'app', 'icon.png'), favicon);
  console.log('Generated app/icon.png (favicon)');
  // Apple touch icon 180x180
  const appleIcon = await sharp(svg)
    .resize(180, 180)
    .png()
    .toBuffer();
  writeFileSync(join(root, 'app', 'apple-icon.png'), appleIcon);
  console.log('Generated app/apple-icon.png');
}

generateIcons().catch(console.error);
