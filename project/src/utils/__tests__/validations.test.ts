import { describe, test, expect } from 'vitest';
import { validateForm } from '../validations';
import type { PayslipData } from '../../types';

const createMockPayslipData = (overrides = {}): PayslipData => ({
  payPeriod: {
    startDate: '2024-01-01',
    endDate: '2024-01-14'
  },
  workedTime: {
    workedTime: { amount: '80', unitType: 'hours', total: '2000' },
    overtime: { amount: '', unitType: 'hours', total: '' },
    other: { amount: '', unitType: 'hours', total: '' }
  },
  bapsLeave: {
    sickLeave: { amount: '', unitType: 'hours', total: '' },
    publicHolidays: { amount: '', unitType: 'hours', total: '' },
    other: { amount: '', unitType: 'hours', total: '' }
  },
  holidayPay: {
    annualLeave: { amount: '', unitType: 'hours', total: '' },
    other: { amount: '', unitType: 'hours', total: '' }
  },
  otherEarnings: {
    taxedAllowance: { total: '' },
    untaxedAllowance: { total: '' },
    bonus: { total: '' },
    commission: { total: '' },
    other: { total: '' }
  },
  ytdEarnings: {
    total: '52000'
  },
  employmentConditions: {
    hoursPerDay: '8',
    daysPerWeek: '5',
    ordinaryPay: {
      amount: '25',
      type: 'hourly',
      allowBelowMinimum: false
    }
  },
  ...overrides
});

describe('validateForm', () => {
  test('validates valid payslip data', () => {
    const data = createMockPayslipData();
    const errors = validateForm(data);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test('requires pay period dates', () => {
    const data = createMockPayslipData({
      payPeriod: { startDate: '', endDate: '' }
    });
    const errors = validateForm(data);
    expect(errors.payPeriod).toBeDefined();
  });

  test('validates YTD earnings', () => {
    const data = createMockPayslipData({
      ytdEarnings: { total: '-100' }
    });
    const errors = validateForm(data);
    expect(errors.ytdEarnings).toBeDefined();
  });

  test('requires at least one type of payment', () => {
    const data = createMockPayslipData({
      workedTime: {
        workedTime: { amount: '', unitType: 'hours', total: '' },
        overtime: { amount: '', unitType: 'hours', total: '' },
        other: { amount: '', unitType: 'hours', total: '' }
      }
    });
    const errors = validateForm(data);
    expect(errors.workedTime?.general).toBeDefined();
  });

  test('checks worked time rates against ordinary pay', () => {
    const data = createMockPayslipData({
      workedTime: {
        workedTime: { amount: '80', unitType: 'hours', total: '1600' } // $20/hour
      },
      employmentConditions: {
        hoursPerDay: '8',
        daysPerWeek: '5',
        ordinaryPay: {
          amount: '25',
          type: 'hourly',
          allowBelowMinimum: false
        }
      }
    });
    const errors = validateForm(data);
    expect(errors.summary).toBeDefined();
    expect(errors.summary![0]).toContain('below ordinary pay rate');
  });
});