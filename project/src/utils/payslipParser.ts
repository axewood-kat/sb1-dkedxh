import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface TextItem {
  text: string;
  x: number;
  y: number;
}

export async function parsePayslip(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: true,
      isEvalSupported: true
    }).promise;

    // Extract text with positioning information
    const textItems: TextItem[] = [];
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false
    });

    // Process text items with their positions
    textContent.items.forEach((item: any) => {
      if (typeof item.str === 'string' && item.str.trim()) {
        textItems.push({
          text: item.str.trim(),
          x: Math.round(item.transform[4]),
          y: Math.round(item.transform[5])
        });
      }
    });

    // Sort items by vertical position (top to bottom)
    textItems.sort((a, b) => b.y - a.y);

    // Group items into lines for better context
    const lines = groupIntoLines(textItems);

    // Extract specific data using patterns and positions
    const data = extractPayslipData(textItems, lines);
    await pdf.destroy();

    return data;
  } catch (error) {
    console.error('Payslip parsing error:', error);
    throw error instanceof Error ? error : new Error('Failed to process payslip');
  }
}

function groupIntoLines(items: TextItem[]): string[] {
  const lines: string[] = [];
  let currentY = items[0]?.y;
  let currentLine = '';

  items.forEach(item => {
    if (Math.abs(item.y - currentY) > 5) {
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

function extractPayslipData(items: TextItem[], lines: string[]) {
  const data = {
    payPeriod: {
      startDate: '',
      endDate: ''
    },
    workedTime: {
      workedTime: { hours: '', rate: '', total: '' },
      overtime: { hours: '', rate: '', total: '' },
      other: { hours: '', rate: '', total: '' }
    },
    bapsLeave: {
      sickLeave: { time: '', rate: '', unit: 'hours', total: '' },
      publicHolidays: { time: '', rate: '', unit: 'hours', total: '' },
      other: { time: '', rate: '', unit: 'hours', total: '' }
    },
    holidayPay: {
      annualLeave: { time: '', rate: '', unit: 'hours', total: '' },
      other: { time: '', rate: '', unit: 'hours', total: '' }
    },
    ytdEarnings: {
      total: ''
    },
    employmentConditions: {
      hoursPerDay: '8',
      daysPerWeek: '5',
      startDate: '',
      ordinaryPay: {
        amount: '',
        type: 'hourly',
        allowBelowMinimum: false
      }
    }
  };

  // Find pay period dates
  const datePattern = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/;
  const dateItems = items.filter(item => datePattern.test(item.text));
  if (dateItems.length >= 2) {
    const sortedDates = dateItems
      .map(item => item.text)
      .map(formatDate)
      .filter(date => date);

    if (sortedDates.length >= 2) {
      data.payPeriod.startDate = sortedDates[0];
      data.payPeriod.endDate = sortedDates[1];
    }
  }

  // Find worked time entries using multiple patterns
  const timePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)/i,
    /(\d+(?:\.\d+)?)\s*(?:ordinary|regular|std)/i,
    /(\d+(?:\.\d+)?)\s*@\s*(?:\$)?(\d+(?:\.\d+)?)/
  ];

  const ratePattern = /(?:(?:rate|@)\s*)?(?:\$)?(\d+(?:\.\d+)?)/;
  const totalPattern = /(?:total|amount|pay)?\s*(?:\$)?(\d+(?:\.\d+)?)/i;

  // Process each line for worked time entries
  lines.forEach((line, index) => {
    // Skip if line contains YTD or year-to-date
    if (/ytd|year\s*to\s*date/i.test(line)) {
      return;
    }

    // Check for overtime first
    const isOvertime = /overtime|ot\b/i.test(line);
    const target = isOvertime ? data.workedTime.overtime : data.workedTime.workedTime;

    // Try to find hours worked
    for (const pattern of timePatterns) {
      const hourMatch = line.match(pattern);
      if (hourMatch) {
        target.hours = hourMatch[1];
        
        // Look for rate in the same line or nearby lines
        const rateMatch = line.match(ratePattern) || 
                         lines[index - 1]?.match(ratePattern) ||
                         lines[index + 1]?.match(ratePattern);
        
        if (rateMatch) {
          target.rate = rateMatch[1];
        }

        // Look for total amount
        const totalMatch = line.match(totalPattern) ||
                          lines[index - 1]?.match(totalPattern) ||
                          lines[index + 1]?.match(totalPattern);
        
        if (totalMatch) {
          target.total = totalMatch[1];
        } else if (target.hours && target.rate) {
          // Calculate total if not found
          target.total = (parseFloat(target.hours) * parseFloat(target.rate)).toFixed(2);
        }

        break;
      }
    }
  });

  // Find YTD earnings only if explicitly labeled
  const ytdPattern = /ytd|year\s*to\s*date/i;
  const ytdLine = lines.find(line => ytdPattern.test(line));
  if (ytdLine) {
    const amountMatch = ytdLine.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (amountMatch) {
      data.ytdEarnings.total = amountMatch[1].replace(/,/g, '');
    }
  }

  return data;
}

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split(/[/-]/);
    
    if (parts.length !== 3) {
      throw new Error('Invalid date format');
    }

    let day: number, month: number, year: number;

    if (parts[2].length === 2) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = 2000 + parseInt(parts[2], 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }

    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}