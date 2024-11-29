interface ProcessedData {
  text: string;
  amounts: number[];
  dates: string[];
}

export async function processImage(imageData: string): Promise<ProcessedData> {
  try {
    // Create image element to analyze
    const img = new Image();
    img.src = imageData;
    await new Promise((resolve) => { img.onload = resolve; });

    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image to canvas
    ctx.drawImage(img, 0, 0);

    // Get image data for processing
    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Enhance contrast and convert to grayscale
    enhanceImageData(imageDataObj);
    ctx.putImageData(imageDataObj, 0, 0);

    // Convert to base64 for OCR
    const enhancedImageData = canvas.toDataURL('image/jpeg', 0.95);

    // Extract text using browser's native image recognition
    const text = await recognizeText(enhancedImageData);

    // Extract amounts and dates
    const amounts = extractAmounts(text);
    const dates = extractDates(text);

    return {
      text,
      amounts,
      dates
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process payslip image');
  }
}

function enhanceImageData(imageData: ImageData): void {
  const data = imageData.data;
  
  // Convert to grayscale and enhance contrast
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Convert to grayscale
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Enhance contrast
    gray = gray < 128 ? 0 : 255;
    
    // Set RGB channels to the same value
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

async function recognizeText(imageData: string): Promise<string> {
  // Create image element for text recognition
  const img = document.createElement('img');
  img.src = imageData;
  await new Promise((resolve) => { img.onload = resolve; });

  // Use native browser image recognition if available
  if ('ImageCapture' in window) {
    try {
      // @ts-ignore - ImageCapture API types not available
      const imageCapture = new ImageCapture(img);
      // @ts-ignore
      const bitmap = await imageCapture.grabFrame();
      // @ts-ignore
      const result = await bitmap.recognize();
      return result.text;
    } catch (error) {
      console.warn('Native image recognition failed:', error);
    }
  }

  // Fallback: Return empty string and let the calling code handle it
  return '';
}

function extractAmounts(text: string): number[] {
  const amountRegex = /\$?\d{1,3}(?:,?\d{3})*(?:\.\d{2})?/g;
  const matches = text.match(amountRegex) || [];
  
  return matches
    .map(match => parseFloat(match.replace(/[$,]/g, '')))
    .filter(amount => !isNaN(amount))
    .sort((a, b) => b - a);
}

function extractDates(text: string): string[] {
  const dateRegex = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
  return text.match(dateRegex) || [];
}