import type { LeaveUnit, LeaveBalance, LeaveEntitlements } from '../types';

const HOURS_PER_DAY = 8;
const HOURS_PER_WEEK = 40;
const DAYS_PER_WEEK = 5;

export function convertLeaveBalance(amount: number, fromUnit: LeaveUnit, toUnit: LeaveUnit): number {
  if (fromUnit === toUnit) return amount;

  // Convert to hours first
  let hours = amount;
  if (fromUnit === 'day') {
    hours = amount * HOURS_PER_DAY;
  } else if (fromUnit === 'week') {
    hours = amount * HOURS_PER_WEEK;
  }

  // Convert hours to target unit
  if (toUnit === 'hour') {
    return hours;
  } else if (toUnit === 'day') {
    return hours / HOURS_PER_DAY;
  } else {
    return hours / HOURS_PER_WEEK;
  }
}

export function calculateLeaveEntitlements(
  weeklyRate: number,
  preferredUnit: LeaveUnit = 'day'
): LeaveEntitlements {
  // Base entitlements in weeks
  const baseEntitlements = {
    annualLeave: 4, // 4 weeks per year
    sickLeave: 2, // 10 days = 2 weeks
    bereavementLeave: 0.6, // 3 days = 0.6 weeks
    familyViolenceLeave: 2, // 10 days = 2 weeks
    publicHolidays: 4.2, // ~11 days = 4.2 weeks
    alternativeHolidays: 0, // Calculated separately based on worked public holidays
  };

  const convertToPreferredUnit = (weeks: number): LeaveBalance => ({
    amount: convertLeaveBalance(weeks, 'week', preferredUnit),
    unit: preferredUnit,
  });

  return {
    annualLeave: convertToPreferredUnit(baseEntitlements.annualLeave),
    sickLeave: convertToPreferredUnit(baseEntitlements.sickLeave),
    bereavementLeave: convertToPreferredUnit(baseEntitlements.bereavementLeave),
    familyViolenceLeave: convertToPreferredUnit(baseEntitlements.familyViolenceLeave),
    publicHolidays: convertToPreferredUnit(baseEntitlements.publicHolidays),
    alternativeHolidays: convertToPreferredUnit(baseEntitlements.alternativeHolidays),
  };
}

export function formatLeaveBalance(balance: LeaveBalance): string {
  const unitLabel = balance.unit === 'hour' ? 'hours' : 
                    balance.unit === 'day' ? 'days' : 'weeks';
  return `${balance.amount.toFixed(1)} ${unitLabel}`;
}

export function calculateLeaveRate(weeklyRate: number, unit: LeaveUnit): number {
  if (unit === 'week') return weeklyRate;
  if (unit === 'day') return weeklyRate / DAYS_PER_WEEK;
  return weeklyRate / HOURS_PER_WEEK;
}