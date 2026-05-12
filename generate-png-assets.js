import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const publicDir = path.join(process.cwd(), 'public');
const assetsDir = path.join(process.cwd(), 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

const sourceFile = path.join(publicDir, 'logo(1).jpg');

async function processImages() {
  try {
    await sharp(sourceFile)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(assetsDir, 'icon.png'));
      
    await sharp(sourceFile)
      .resize(2732, 2732, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(assetsDir, 'splash.png'));
      
    console.log('Successfully generated icon.png and splash.png in assets directory');
  } catch (err) {
    console.error('Error generating assets:', err);
  }
}

processImages();
