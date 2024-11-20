import { PayslipData } from '../types';

export async function processPayslipImage(imageData: string): Promise<PayslipData> {
  try {
    console.log('Initiating payslip processing...');

    const response = await fetch('/.netlify/functions/process-payslip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    console.log('Response status:', response.status);
    const contentType = response.headers.get('Content-Type');
    console.log('Response content type:', contentType);

    const text = await response.text();
    console.log('Response text length:', text.length);
    console.log('First 100 chars of response:', text.substring(0, 100));

    if (!text) {
      throw new Error('Empty response from server');
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Full response text:', text);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      const errorMessage = data.error || data.details || 'Failed to process payslip';
      console.error('Server error:', data);
      throw new Error(errorMessage);
    }

    if (!isValidPayslipData(data)) {
      console.error('Invalid data structure:', data);
      throw new Error('Invalid payslip data structure received');
    }

    console.log('Processing completed successfully');
    return normalizePayslipData(data);
  } catch (error) {
    console.error('Payslip processing error:', error);
    throw error;
  }
}

function isValidPayslipData(data: any): boolean {
  try {
    if (!data || typeof data !== 'object') {
      console.log('Data is not an object');
      return false;
    }

    const requiredProps = ['payPeriod', 'workedTime', 'bapsLeave', 'holidayPay', 'ytdEarnings'];
    for (const prop of requiredProps) {
      if (!(prop in data)) {
        console.log(`Missing required property: ${prop}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

function normalizePayslipData(rawData: any): PayslipData {
  console.log('Normalizing data...');
  return {
    payPeriod: {
      startDate: rawData.payPeriod?.startDate || '',
      endDate: rawData.payPeriod?.endDate || '',
    },
    workedTime: {
      workedTime: {
        hours: rawData.workedTime?.workedTime?.hours || '',
        rate: rawData.workedTime?.workedTime?.rate || '',
        total: rawData.workedTime?.workedTime?.total || '',
      },
      overtime: {
        hours: rawData.workedTime?.overtime?.hours || '',
        rate: rawData.workedTime?.overtime?.rate || '',
        total: rawData.workedTime?.overtime?.total || '',
      },
      other: {
        hours: rawData.workedTime?.other?.hours || '',
        rate: rawData.workedTime?.other?.rate || '',
        total: rawData.workedTime?.other?.total || '',
      },
    },
    bapsLeave: {
      sickLeave: {
        time: rawData.bapsLeave?.sickLeave?.time || '',
        rate: rawData.bapsLeave?.sickLeave?.rate || '',
        unit: 'hours',
        total: rawData.bapsLeave?.sickLeave?.total || '',
      },
      publicHolidays: {
        time: rawData.bapsLeave?.publicHolidays?.time || '',
        rate: rawData.bapsLeave?.publicHolidays?.rate || '',
        unit: 'hours',
        total: rawData.bapsLeave?.publicHolidays?.total || '',
      },
      other: {
        time: rawData.bapsLeave?.other?.time || '',
        rate: rawData.bapsLeave?.other?.rate || '',
        unit: 'hours',
        total: rawData.bapsLeave?.other?.total || '',
      },
    },
    holidayPay: {
      annualLeave: {
        time: rawData.holidayPay?.annualLeave?.time || '',
        rate: rawData.holidayPay?.annualLeave?.rate || '',
        unit: 'hours',
        total: rawData.holidayPay?.annualLeave?.total || '',
      },
      other: {
        time: rawData.holidayPay?.other?.time || '',
        rate: rawData.holidayPay?.other?.rate || '',
        unit: 'hours',
        total: rawData.holidayPay?.other?.total || '',
      },
    },
    ytdEarnings: {
      total: rawData.ytdEarnings?.total || '',
    },
    employmentConditions: {
      hoursPerDay: rawData.employmentConditions?.hoursPerDay || '8',
      daysPerWeek: rawData.employmentConditions?.daysPerWeek || '5',
      startDate: rawData.employmentConditions?.startDate || '',
      ordinaryPay: {
        amount: rawData.employmentConditions?.ordinaryPay?.amount || '',
        type: rawData.employmentConditions?.ordinaryPay?.type || 'hourly',
        allowBelowMinimum: rawData.employmentConditions?.ordinaryPay?.allowBelowMinimum || false,
      },
    },
  };
}