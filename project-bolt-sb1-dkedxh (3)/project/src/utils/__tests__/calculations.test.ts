import { describe, test, expect } from 'vitest';
import {
  calculateHourlyRate,
  isAboveMinimumWage,
  convertToHours,
  calculateWorkedTimeRate,
  calculateEstimatedOWP,
  calculateAWE,
  calculateHolidayPayRates,
  calculateLeaveRate
} from '../calculations';
import type { OrdinaryPay, PayItem } from '../../types';

describe('calculateHourlyRate', () => {
  test('calculates hourly rate from hourly input', () => {
    const ordinaryPay: OrdinaryPay = {
      amount: '25',
      type: 'hourly',
      allowBelowMinimum: false
    };
    expect(calculateHourlyRate(ordinaryPay, 8, 5)).toBe(25);
  });

  test('calculates hourly rate from annual salary', () => {
    const ordinaryPay: OrdinaryPay = {
      amount: '52000',
      type: 'annual',
      allowBelowMinimum: false
    };
    // 52000 / (52 weeks * 40 hours) = 25/hour
    expect(calculateHourlyRate(ordinaryPay, 8, 5)).toBe(25);
  });
});

describe('isAboveMinimumWage', () => {
  test('identifies rate above minimum wage', () => {
    const ordinaryPay: OrdinaryPay = {
      amount: '25',
      type: 'hourly',
      allowBelowMinimum: false
    };
    expect(isAboveMinimumWage(ordinaryPay, 8, 5)).toBe(true);
  });

  test('identifies rate below minimum wage', () => {
    const ordinaryPay: OrdinaryPay = {
      amount: '20',
      type: 'hourly',
      allowBelowMinimum: false
    };
    expect(isAboveMinimumWage(ordinaryPay, 8, 5)).toBe(false);
  });

  test('identifies annual salary below minimum wage', () => {
    const ordinaryPay: OrdinaryPay = {
      amount: '40000',
      type: 'annual',
      allowBelowMinimum: false
    };
    expect(isAboveMinimumWage(ordinaryPay, 8, 5)).toBe(false);
  });
});

describe('convertToHours', () => {
  test('converts hours correctly', () => {
    expect(convertToHours('8', 'hours', 8, 5)).toBe(8);
  });

  test('converts days to hours', () => {
    expect(convertToHours('1', 'days', 8, 5)).toBe(8);
  });

  test('converts weeks to hours', () => {
    expect(convertToHours('1', 'weeks', 8, 5)).toBe(40);
  });
});

describe('calculateWorkedTimeRate', () => {
  test('calculates rate from worked time', () => {
    const workedTime: PayItem = {
      amount: '8',
      unitType: 'hours',
      total: '200'
    };
    expect(calculateWorkedTimeRate(workedTime, 8, 5)).toBe(25);
  });

  test('falls back to ordinary pay when no worked time', () => {
    const workedTime: PayItem = {
      amount: '',
      unitType: 'hours',
      total: ''
    };
    const ordinaryPay: OrdinaryPay = {
      amount: '25',
      type: 'hourly',
      allowBelowMinimum: false
    };
    expect(calculateWorkedTimeRate(workedTime, 8, 5, ordinaryPay)).toBe(25);
  });
});

describe('calculateEstimatedOWP', () => {
  test('uses worked time rate when available', () => {
    const result = calculateEstimatedOWP(25, undefined, 8, 5);
    expect(result.hourly).toBe(25);
    expect(result.daily).toBe(200);
    expect(result.weekly).toBe(1000);
  });

  test('falls back to ordinary pay when no worked time rate', () => {
    const ordinaryPay: OrdinaryPay = {
      amount: '25',
      type: 'hourly',
      allowBelowMinimum: false
    };
    const result = calculateEstimatedOWP(0, ordinaryPay, 8, 5);
    expect(result.hourly).toBe(25);
    expect(result.daily).toBe(200);
    expect(result.weekly).toBe(1000);
  });
});

describe('calculateAWE', () => {
  test('calculates average weekly earnings', () => {
    const result = calculateAWE(52000, 8, 5);
    expect(result.weekly).toBe(1000);
    expect(result.daily).toBe(200);
    expect(result.hourly).toBe(25);
  });

  test('adjusts calculation based on employment start date', () => {
    // Mock current date to make test deterministic
    const mockDate = new Date('2024-03-15');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const result = calculateAWE(26000, 8, 5, '2023-10-01');
    // 26000 / (24 weeks) ≈ 1083.33 per week
    expect(Math.round(result.weekly)).toBe(1083);

    vi.useRealTimers();
  });
});

describe('calculateHolidayPayRates', () => {
  test('calculates holiday pay rates', () => {
    const result = calculateHolidayPayRates(25, 52000, '2024-01-01', '2024-01-14', 8, 5);
    expect(result.owp.hourly).toBe(25);
    expect(result.awe.hourly).toBe(25);
    expect(result.useEstimatedOWP).toBe(true);
  });

  test('uses estimated OWP for short periods', () => {
    const result = calculateHolidayPayRates(25, 52000, '2024-03-01', '2024-03-07', 8, 5);
    expect(result.useEstimatedOWP).toBe(true);
  });
});

describe('calculateLeaveRate', () => {
  test('calculates leave rates', () => {
    const leaveItem: PayItem = {
      amount: '8',
      unitType: 'hours',
      total: '200'
    };
    const result = calculateLeaveRate(leaveItem, 25, 52000, 8, 5);
    expect(result.rdp.hourly).toBe(25);
    expect(result.adp.hourly).toBe(25);
    expect(result.useRDP).toBe(true);
  });

  test('handles ordinary pay fallback', () => {
    const leaveItem: PayItem = {
      amount: '8',
      unitType: 'hours',
      total: '160'
    };
    const ordinaryPay: OrdinaryPay = {
      amount: '25',
      type: 'hourly',
      allowBelowMinimum: false
    };
    const result = calculateLeaveRate(leaveItem, 0, 52000, 8, 5, undefined, ordinaryPay);
    expect(result.rdp.hourly).toBe(25);
    expect(result.useRDP).toBe(true);
  });
});