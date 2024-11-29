import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configure worker
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

async function convertPDFToImage(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: true,
      isEvalSupported: true
    }).promise;

    // Get the first page
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not create canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert to image data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    await pdf.destroy();
    
    return imageData;
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    throw new Error('Failed to convert PDF to image');
  }
}

export async function parsePayslip(file: File) {
  try {
    console.log('Starting payslip processing...');
    
    // Convert PDF to image first
    const imageData = await convertPDFToImage(file);
    
    // Send to serverless function
    const response = await fetch('/.netlify/functions/process-payslip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Processing completed successfully');
    return data;
  } catch (error) {
    console.error('Payslip processing error:', error);
    throw error instanceof Error ? error : new Error('Failed to process payslip');
  }
}