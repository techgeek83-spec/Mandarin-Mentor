const sharp = require('sharp');
const fs = require('fs');

async function processRawIcon() {
  const input = fs.existsSync('public/icon-raw.png') ? 'public/icon-raw.png' : 'public/icon-raw.jpg';
  if (!fs.existsSync(input)) {
    console.error('Missing public/icon-raw.png or public/icon-raw.jpg');
    process.exit(1);
  }
  
  const meta = await sharp(input).metadata();
  const width = meta.width;
  const height = meta.height;

  // Architectural Note: Expanded bounding box to prevent clipping the outer green circle and character strokes while avoiding faux card corners.
  const cropLeft = Math.floor(width * 0.18);
  const cropTop = Math.floor(height * 0.18);
  const cropWidth = Math.floor(width * 0.64);
  const cropHeight = Math.floor(height * 0.64);

  const croppedBadge = await sharp(input)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .toBuffer();

  // Unified background color for all generated assets
  const baseBg = { r: 244, g: 239, b: 230, alpha: 1 };
  const hexBg = '#F4EFE6';

  // 1. Standard 192x192
  await sharp(croppedBadge)
    .resize(192, 192, { fit: 'contain', background: baseBg })
    .png()
    .toFile('public/icon-192.png');

  // 2. Standard & Splash 512x512
  await sharp(croppedBadge)
    .resize(512, 512, { fit: 'contain', background: baseBg })
    .png()
    .toFile('public/icon-512.png');

  // Architectural Note: Shrinking the maskable badge specifically to 240px guarantees the entire circular graphic and tail remain safely inside Android's strict 409px circular mask boundary without edge clipping.
  // 3. Android Maskable 512x512 
  const maskBg = { r: 244, g: 239, b: 230, alpha: 1 };
  await sharp(croppedBadge)
    .resize(240, 240, { fit: 'contain', background: baseBg })
    .extend({ top: 136, bottom: 136, left: 136, right: 136, background: maskBg })
    .png()
    .toFile('public/icon-maskable-512.png');

  // 4. iOS Apple Touch Icon 180x180 (Direct opaque resize)
  await sharp(croppedBadge)
    .resize(180, 180, { fit: 'contain', background: baseBg })
    .flatten({ background: hexBg })
    .png()
    .toFile('public/apple-touch-icon.png');

  console.log('Icon bounding crop and maskable generation complete.');
}

processRawIcon().catch((err) => {
  console.error(err);
  process.exit(1);
});