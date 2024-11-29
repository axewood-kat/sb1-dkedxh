import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// Configure worker with CDN fallback
const PDFJS_VERSION = '3.11.174';
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

// Constants
const PARSE_TIMEOUT = 30000; // 30 seconds
const MAX_PAGES = 50;
const SCALE = 1.0;

interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ExtractedText {
  lines: string[];
  items: TextItem[];
  raw: string;
}

export class PDFReader {
  private pdf: PDFDocumentProxy | null = null;
  private abortController: AbortController | null = null;

  async loadPDF(file: File): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Create new abort controller for this operation
      this.abortController = new AbortController();
      const signal = this.abortController.signal;

      const loadingTask = getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: true,
        isEvalSupported: true,
        useSystemFonts: true,
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/standard_fonts/`
      });

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.abortController?.abort();
        loadingTask.destroy();
      }, PARSE_TIMEOUT);

      try {
        this.pdf = await Promise.race([
          loadingTask.promise,
          new Promise((_, reject) => {
            signal.addEventListener('abort', () => 
              reject(new Error('PDF loading timed out'))
            );
          })
        ]);
        
        clearTimeout(timeoutId);

        if (this.pdf.numPages > MAX_PAGES) {
          throw new Error(`PDF has too many pages (${this.pdf.numPages}). Maximum allowed is ${MAX_PAGES}.`);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to load PDF file. Please ensure it is a valid PDF document.'
      );
    }
  }

  async extractText(): Promise<ExtractedText> {
    if (!this.pdf) {
      throw new Error('No PDF loaded. Call loadPDF() first.');
    }

    const textItems: TextItem[] = [];
    const lines: string[] = [];
    let fullText = '';

    try {
      // Process first 2 pages only for payslip (optimization)
      const pagesToProcess = Math.min(2, this.pdf.numPages);
      
      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await this.pdf.getPage(i);
        const viewport = page.getViewport({ scale: SCALE });

        try {
          const content = await page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false,
            includeMarkedContent: false
          });

          if (!content.items.length) {
            console.warn(`No text content found on page ${i}`);
            continue;
          }

          // Process text items in batches for better performance
          const BATCH_SIZE = 100;
          for (let j = 0; j < content.items.length; j += BATCH_SIZE) {
            const batch = content.items.slice(j, j + BATCH_SIZE);
            
            const processedItems = batch
              .filter((item: any) => typeof item.str === 'string' && item.str.trim().length > 0)
              .map((item: any) => {
                const tx = item.transform;
                const fontHeight = Math.sqrt((tx[0] * tx[0]) + (tx[1] * tx[1]));
                
                return {
                  text: item.str.trim(),
                  x: Math.round(tx[4]),
                  y: Math.round(viewport.height - tx[5]),
                  width: Math.round(fontHeight * item.width),
                  height: Math.round(fontHeight)
                };
              });

            textItems.push(...processedItems);
          }

          // Sort and group text items into lines
          const groupedItems = this.groupItemsIntoLines(textItems);
          lines.push(...groupedItems);
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
        }
      }

      fullText = lines.join('\n').trim();

      if (!fullText) {
        throw new Error(
          'No readable text found in the PDF. This might be because:\n' +
          '- The PDF is password-protected\n' +
          '- The PDF is scanned (image-only)\n' +
          '- The PDF is corrupted\n' +
          'Please try downloading a digital copy from your payroll system.'
        );
      }

      return {
        lines: lines.filter(line => line.length > 0),
        items: textItems,
        raw: fullText
      };
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error instanceof Error ? error : new Error('Failed to extract text from PDF');
    }
  }

  private groupItemsIntoLines(items: TextItem[]): string[] {
    // Sort by vertical position first, then horizontal
    items.sort((a, b) => {
      const yDiff = b.y - a.y;
      return Math.abs(yDiff) < 5 ? a.x - b.x : yDiff;
    });

    const lines: string[] = [];
    let currentY = items[0]?.y;
    let currentLine = '';

    items.forEach(item => {
      if (Math.abs(item.y - currentY) > item.height) {
        if (currentLine) {
          lines.push(currentLine.trim());
        }
        currentLine = item.text;
        currentY = item.y;
      } else {
        if (currentLine && !currentLine.endsWith(' ') && !item.text.startsWith(' ')) {
          currentLine += ' ';
        }
        currentLine += item.text;
      }
    });

    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines;
  }

  async close(): Promise<void> {
    try {
      this.abortController?.abort();
      if (this.pdf) {
        await this.pdf.destroy();
      }
    } catch (error) {
      console.error('Error destroying PDF:', error);
    } finally {
      this.pdf = null;
      this.abortController = null;
    }
  }
}