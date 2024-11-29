import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  // Create public directory if it doesn't exist
  const publicDir = join(__dirname, '../public');
  mkdirSync(publicDir, { recursive: true });

  // Copy PDF.js worker
  const pdfWorkerSource = require.resolve('pdfjs-dist/build/pdf.worker.min.js');
  const pdfWorkerTarget = join(publicDir, 'pdf.worker.min.js');
  copyFileSync(pdfWorkerSource, pdfWorkerTarget);

  console.log('PDF.js worker file copied successfully');
} catch (error) {
  console.error('Error copying PDF.js worker file:', error);
  process.exit(1);
}