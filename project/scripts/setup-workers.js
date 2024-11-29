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

  // Copy Tesseract.js worker
  const tesseractPath = dirname(require.resolve('tesseract.js/dist/worker.min.js'));
  const workerSource = join(tesseractPath, 'worker.min.js');
  const workerTarget = join(publicDir, 'tesseract-worker.min.js');
  copyFileSync(workerSource, workerTarget);

  // Copy core WASM files
  const corePath = dirname(require.resolve('tesseract.js-core/tesseract-core.wasm'));
  const wasmFiles = ['tesseract-core.wasm', 'tesseract-core-simd.wasm'];
  
  wasmFiles.forEach(file => {
    try {
      const source = join(corePath, file);
      const target = join(publicDir, file);
      copyFileSync(source, target);
    } catch (error) {
      console.warn(`Warning: Could not copy ${file}, skipping...`);
    }
  });

  console.log('Worker files copied successfully');
} catch (error) {
  console.error('Error copying worker files:', error);
  process.exit(1);
}