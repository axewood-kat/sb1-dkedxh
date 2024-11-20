import type { PayslipData, WorkedTimeItem, BAPSLeaveItem, HolidayPayItem } from '../types';

const getSectionName = (section: string): string => {
  const sectionNames: Record<string, string> = {
    workedTime: 'Worked Time',
    bapsLeave: 'BAPS Leave',
    holidayPay: 'Holiday Pay'
  };
  return sectionNames[section] || section;
};

const getDisplayName = (section: string, field: string): string => {
  const sectionDisplayNames: Record<string, Record<string, string>> = {
    workedTime: {
      workedTime: 'Regular Hours',
      overtime: 'Overtime',
      other: `Other (${getSectionName(section)})`
    },
    bapsLeave: {
      sickLeave: 'Sick Leave',
      publicHolidays: 'Public Holidays',
      other: `Other (${getSectionName(section)})`
    },
    holidayPay: {
      annualLeave: 'Annual Leave',
      other: `Other (${getSectionName(section)})`
    }
  };

  return sectionDisplayNames[section]?.[field] || field;
};

const validatePayPeriod = (payPeriod: PayslipData['payPeriod']): string | undefined => {
  if (!payPeriod.startDate || !payPeriod.endDate) {
    return 'Pay period start and end dates are required';
  }

  const startDate = new Date(payPeriod.startDate);
  const endDate = new Date(payPeriod.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Invalid pay period dates';
  }

  if (endDate < startDate) {
    return 'End date cannot be before start date';
  }

  return undefined;
};

const validateWorkedTimeItem = (item: WorkedTimeItem, fieldName: string, section: string): string | undefined => {
  if (!item) return undefined;

  const displayName = getDisplayName(section, fieldName);
  const hasHours = item.hours && item.hours.trim() !== '';
  const hasRate = item.rate && item.rate.trim() !== '';

  if (hasHours && !hasRate) {
    return `${displayName} requires a rate when hours are provided`;
  }

  if (!hasHours && hasRate) {
    return `${displayName} requires hours when rate is provided`;
  }

  return undefined;
};

const validateBAPSLeaveItem = (item: BAPSLeaveItem, fieldName: string, section: string): string | undefined => {
  if (!item) return undefined;

  const displayName = getDisplayName(section, fieldName);
  const hasTime = item.time && item.time.trim() !== '';
  const hasRate = item.rate && item.rate.trim() !== '';

  if (hasTime && !hasRate) {
    return `${displayName} requires a rate when time is provided`;
  }

  if (!hasTime && hasRate) {
    return `${displayName} requires time when rate is provided`;
  }

  return undefined;
};

const validateHolidayPayItem = (item: HolidayPayItem, fieldName: string, section: string): string | undefined => {
  if (!item) return undefined;

  const displayName = getDisplayName(section, fieldName);
  const hasTime = item.time && item.time.trim() !== '';
  const hasRate = item.rate && item.rate.trim() !== '';

  if (hasTime && !hasRate) {
    return `${displayName} requires a rate when time is provided`;
  }

  if (!hasTime && hasRate) {
    return `${displayName} requires time when rate is provided`;
  }

  return undefined;
};

export const validateForm = (data: PayslipData): Record<string, any> => {
  const errors: Record<string, any> = {};

  // Pay Period validation
  const payPeriodError = validatePayPeriod(data.payPeriod);
  if (payPeriodError) {
    errors.payPeriod = payPeriodError;
  }

  // Worked Time validation
  const workedTimeErrors: Record<string, string> = {};
  Object.entries(data.workedTime).forEach(([key, value]) => {
    const error = validateWorkedTimeItem(value, key, 'workedTime');
    if (error) workedTimeErrors[key] = error;
  });
  if (Object.keys(workedTimeErrors).length > 0) {
    errors.workedTime = workedTimeErrors;
  }

  // BAPS Leave validation
  const bapsLeaveErrors: Record<string, string> = {};
  Object.entries(data.bapsLeave).forEach(([key, value]) => {
    const error = validateBAPSLeaveItem(value, key, 'bapsLeave');
    if (error) bapsLeaveErrors[key] = error;
  });
  if (Object.keys(bapsLeaveErrors).length > 0) {
    errors.bapsLeave = bapsLeaveErrors;
  }

  // Holiday Pay validation
  const holidayPayErrors: Record<string, string> = {};
  Object.entries(data.holidayPay).forEach(([key, value]) => {
    const error = validateHolidayPayItem(value, key, 'holidayPay');
    if (error) holidayPayErrors[key] = error;
  });
  if (Object.keys(holidayPayErrors).length > 0) {
    errors.holidayPay = holidayPayErrors;
  }

  // Check if at least one section has data
  const hasAnyData = [
    Object.values(data.workedTime).some(item => item.hours && item.rate),
    Object.values(data.bapsLeave).some(item => item.time && item.rate),
    Object.values(data.holidayPay).some(item => item.time && item.rate)
  ].some(Boolean);

  if (!hasAnyData) {
    errors.workedTime = { ...errors.workedTime, general: 'At least one type of payment must be entered' };
  }

  // Check for rates below ordinary pay
  if (data.employmentConditions.ordinaryPay?.amount) {
    const ordinaryRate = parseFloat(data.employmentConditions.ordinaryPay.amount);
    if (ordinaryRate > 0) {
      const summary: string[] = [];
      
      Object.entries(data.workedTime).forEach(([key, value]) => {
        if (value.rate && parseFloat(value.rate) < ordinaryRate) {
          summary.push(`${getDisplayName('workedTime', key)} rate is below ordinary pay rate`);
        }
      });

      if (summary.length > 0) {
        errors.summary = summary;
      }
    }
  }

  return errors;
};