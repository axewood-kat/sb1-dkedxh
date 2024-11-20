import type { PayItem, OrdinaryPay } from '../types';

const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const WEEKS_PER_YEAR = 52;
const MIN_WEEKS_FOR_ACTUAL_OWP = 4;
const MINIMUM_WAGE = 22.70; // NZ minimum wage as of 2024

// Get the start of the current tax year (April 1st)
const getCurrentTaxYearStart = (): Date => {
  const now = new Date();
  const year = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  return new Date(year, 3, 1); // Month is 0-based, so 3 = April
};

export const calculateHourlyRate = (
  ordinaryPay: OrdinaryPay,
  hoursPerDay: number,
  daysPerWeek: number
): number => {
  const amount = parseFloat(ordinaryPay.amount || '0');
  if (ordinaryPay.type === 'hourly') {
    return amount;
  }
  // Calculate hourly rate from annual salary
  const hoursPerWeek = hoursPerDay * daysPerWeek;
  const hoursPerYear = hoursPerWeek * WEEKS_PER_YEAR;
  return amount / hoursPerYear;
};

export const isAboveMinimumWage = (
  ordinaryPay: OrdinaryPay,
  hoursPerDay: number,
  daysPerWeek: number
): boolean => {
  const hourlyRate = calculateHourlyRate(ordinaryPay, hoursPerDay, daysPerWeek);
  return hourlyRate >= MINIMUM_WAGE;
};

// Convert any unit to hours based on work pattern
export const convertToHours = (
  amount: string,
  unitType: 'hours' | 'days' | 'weeks',
  hoursPerDay: number,
  daysPerWeek: number
): number => {
  const value = parseFloat(amount || '0');
  switch (unitType) {
    case 'hours':
      return value;
    case 'days':
      return value * hoursPerDay;
    case 'weeks':
      return value * hoursPerDay * daysPerWeek;
    default:
      return value;
  }
};

export const calculatePayPeriodWeeks = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 1;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMilliseconds = end.getTime() - start.getTime();
  
  return Math.max(Math.ceil(diffInMilliseconds / MILLISECONDS_PER_WEEK), 1);
};

export const calculateEstimatedOWP = (
  workedTimeRate: number,
  ordinaryPay: OrdinaryPay | undefined,
  hoursPerDay: number,
  daysPerWeek: number
): {
  hourly: number;
  daily: number;
  weekly: number;
} => {
  let rate = workedTimeRate;
  
  // If no worked time rate but ordinary pay is available, use that
  if (rate === 0 && ordinaryPay?.amount) {
    rate = calculateHourlyRate(ordinaryPay, hoursPerDay, daysPerWeek);
  }

  return {
    hourly: rate,
    daily: rate * hoursPerDay,
    weekly: rate * hoursPerDay * daysPerWeek
  };
};

export const calculateWorkedTimeRate = (
  workedTime: PayItem,
  hoursPerDay: number,
  daysPerWeek: number,
  ordinaryPay?: OrdinaryPay
): number => {
  if (!workedTime.amount || !workedTime.total) {
    // If no worked time but ordinary pay exists, use that
    if (ordinaryPay?.amount) {
      return calculateHourlyRate(ordinaryPay, hoursPerDay, daysPerWeek);
    }
    return 0;
  }

  const hours = convertToHours(
    workedTime.amount,
    workedTime.unitType,
    hoursPerDay,
    daysPerWeek
  );
  return parseFloat(workedTime.total) / hours;
};

export const calculateAWE = (
  ytdEarnings: number,
  hoursPerDay: number,
  daysPerWeek: number,
  employmentStartDate?: string
): {
  hourly: number;
  daily: number;
  weekly: number;
} => {
  const taxYearStart = getCurrentTaxYearStart();
  let effectiveStartDate = taxYearStart;

  // If employment start date exists and is after tax year start, use it
  if (employmentStartDate) {
    const startDate = new Date(employmentStartDate);
    if (startDate > taxYearStart) {
      effectiveStartDate = startDate;
    }
  }

  // Calculate weeks from effective start date to now
  const now = new Date();
  const weeksWorked = Math.max(
    Math.ceil((now.getTime() - effectiveStartDate.getTime()) / MILLISECONDS_PER_WEEK),
    1
  );
  
  const weeklyRate = ytdEarnings / weeksWorked;
  const hoursPerWeek = hoursPerDay * daysPerWeek;
  return {
    weekly: weeklyRate,
    daily: weeklyRate / daysPerWeek,
    hourly: weeklyRate / hoursPerWeek
  };
};

export const calculateHolidayPayRates = (
  workedTimeRate: number,
  ytdEarnings: number,
  periodStartDate: string,
  periodEndDate: string,
  hoursPerDay: number,
  daysPerWeek: number,
  employmentStartDate?: string,
  ordinaryPay?: OrdinaryPay
): {
  owp: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  awe: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  useEstimatedOWP: boolean;
} => {
  const weeksInPeriod = calculatePayPeriodWeeks(periodStartDate, periodEndDate);
  const useEstimatedOWP = weeksInPeriod < MIN_WEEKS_FOR_ACTUAL_OWP;

  const owp = useEstimatedOWP
    ? calculateEstimatedOWP(workedTimeRate, ordinaryPay, hoursPerDay, daysPerWeek)
    : calculateEstimatedOWP(workedTimeRate, ordinaryPay, hoursPerDay, daysPerWeek); // For now, always use estimated OWP
  
  const awe = calculateAWE(ytdEarnings, hoursPerDay, daysPerWeek, employmentStartDate);

  return {
    owp,
    awe,
    useEstimatedOWP
  };
};

export const calculateLeaveRate = (
  leaveItem: PayItem,
  workedTimeRate: number,
  ytdEarnings: number,
  hoursPerDay: number,
  daysPerWeek: number,
  employmentStartDate?: string,
  ordinaryPay?: OrdinaryPay
): {
  rdp: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  adp: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  useRDP: boolean;
} => {
  // Convert the leave amount to hours for consistent calculation
  const hoursAmount = convertToHours(
    leaveItem.amount,
    leaveItem.unitType,
    hoursPerDay,
    daysPerWeek
  );
  
  // Calculate the hourly rate based on the total payment and converted hours
  const paidHourlyRate = parseFloat(leaveItem.total) / hoursAmount;

  // For RDP, use worked time rate if available, otherwise fall back to ordinary pay rate
  const rdpRate = workedTimeRate > 0 ? workedTimeRate : 
    (ordinaryPay?.amount ? calculateHourlyRate(ordinaryPay, hoursPerDay, daysPerWeek) : 0);

  const rdp = calculateEstimatedOWP(rdpRate, ordinaryPay, hoursPerDay, daysPerWeek);
  const adp = calculateAWE(ytdEarnings, hoursPerDay, daysPerWeek, employmentStartDate);
  
  // Use RDP if it's higher than ADP and available
  const useRDP = rdpRate > 0 && rdp.hourly > adp.hourly;

  return {
    rdp,
    adp,
    useRDP
  };
};