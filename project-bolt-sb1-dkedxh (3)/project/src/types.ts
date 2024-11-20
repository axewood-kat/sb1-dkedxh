export interface PayItem {
  time: string;
  rate: string;
  unit: 'hours' | 'days' | 'weeks';
  total: string;
}

export interface PayPeriod {
  startDate: string;
  endDate: string;
}

export interface WorkedTime {
  workedTime: { hours: string; rate: string; total: string };
  overtime: { hours: string; rate: string; total: string };
  other: { hours: string; rate: string; total: string };
}

export interface BAPSLeave {
  sickLeave: PayItem;
  publicHolidays: PayItem;
  other: PayItem;
}

export interface HolidayPay {
  annualLeave: PayItem;
  other: PayItem;
}

export interface OrdinaryPay {
  amount: string;
  type: 'hourly' | 'annual';
  allowBelowMinimum: boolean;
}

export interface EmploymentConditions {
  hoursPerDay: string;
  daysPerWeek: string;
  startDate: string;
  ordinaryPay: OrdinaryPay;
}

export interface PayslipData {
  payPeriod: PayPeriod;
  workedTime: WorkedTime;
  bapsLeave: BAPSLeave;
  holidayPay: HolidayPay;
  ytdEarnings: {
    total: string;
  };
  employmentConditions: EmploymentConditions;
}