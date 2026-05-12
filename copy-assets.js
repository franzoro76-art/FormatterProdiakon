import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const assetsDir = path.join(process.cwd(), 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

fs.copyFileSync(path.join(publicDir, 'logo(1).jpg'), path.join(assetsDir, 'icon.jpg'));
fs.copyFileSync(path.join(publicDir, 'logo(1).jpg'), path.join(assetsDir, 'splash.jpg'));

console.log('Files copied successfully.');
