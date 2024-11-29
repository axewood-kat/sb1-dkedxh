import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// Configure worker
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export async function convertPDFToImage(file: File): Promise<string> {
  let pdf: PDFDocumentProxy | null = null;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: new Uint8Array(arrayBuffer) });
    pdf = await loadingTask.promise;

    // Get the first page only - payslips are usually single page
    const page = await pdf.getPage(1);
    
    // Use a higher scale for better OCR results
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not create canvas context');
    }

    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert to image data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    
    return imageData;
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    throw new Error('Failed to convert PDF to image. Please ensure the file is a valid PDF.');
  } finally {
    if (pdf) {
      await pdf.destroy();
    }
  }
}