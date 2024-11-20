import type { PayElement, PayUnit, PayRate } from '../types';

const HOURS_PER_PERIOD: Record<PayUnit, number> = {
  hour: 1,
  day: 8,
  week: 40,
  month: 173.33, // Average hours per month (52 weeks * 40 hours / 12 months)
  year: 2080, // 52 weeks * 40 hours
  piece: 1,
  fixed: 1,
};

export function convertToHourlyRate(amount: string, unit: PayUnit): number {
  const numericAmount = parseFloat(amount || '0');
  if (isNaN(numericAmount) || numericAmount === 0) return 0;

  const hoursInPeriod = HOURS_PER_PERIOD[unit];
  return numericAmount / hoursInPeriod;
}

export function normalizePayElement(element: PayElement, periodHours: number): PayRate {
  const amount = parseFloat(element.amount || '0');
  if (isNaN(amount) || amount === 0) {
    return { amount: 0, unit: 'hour', baseHourlyRate: 0 };
  }

  const baseHourlyRate = convertToHourlyRate(element.amount, element.unit);

  return {
    amount,
    unit: element.unit,
    baseHourlyRate,
  };
}

export function calculateEffectiveRate(
  regularPay: PayElement,
  hoursWorked: string,
  overtime: { hours: string; rate: string; unit: PayUnit }
): PayRate {
  const regularHours = parseFloat(hoursWorked) - parseFloat(overtime.hours || '0');
  const regularHourlyRate = convertToHourlyRate(regularPay.amount, regularPay.unit);
  const overtimeRate = parseFloat(overtime.rate || '1.5');
  const overtimeHours = parseFloat(overtime.hours || '0');

  const totalPay = (regularHourlyRate * regularHours) + 
                   (regularHourlyRate * overtimeRate * overtimeHours);
  const totalHours = regularHours + overtimeHours;

  return {
    amount: totalPay / totalHours,
    unit: 'hour',
    baseHourlyRate: regularHourlyRate,
  };
}

export function formatRate(rate: PayRate): string {
  if (rate.unit === 'hour') {
    return `$${rate.amount.toFixed(2)}/hr`;
  }
  
  const annualizedRate = rate.amount * HOURS_PER_PERIOD[rate.unit];
  return `$${rate.amount.toFixed(2)}/${rate.unit} ($${annualizedRate.toFixed(2)}/year)`;
}