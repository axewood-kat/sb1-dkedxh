import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceFile = join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.js');
const targetDir = join(__dirname, '../public');
const targetFile = join(targetDir, 'pdf.worker.js');

try {
  mkdirSync(targetDir, { recursive: true });
  copyFileSync(sourceFile, targetFile);
  console.log('PDF.js worker file copied successfully');
} catch (error) {
  console.error('Error copying PDF.js worker file:', error);
  process.exit(1);
}