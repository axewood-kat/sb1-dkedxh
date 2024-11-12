import React from 'react';
import type { HolidayPay } from '../types';
import Tooltip from './Tooltip';

interface HolidayPaySectionProps {
  holidayPay: HolidayPay;
  onChange: (holidayPay: HolidayPay) => void;
}

const UnitToggle = ({ unit, onChange }: { unit: 'hours' | 'days' | 'weeks'; onChange: (unit: 'hours' | 'days' | 'weeks') => void }) => (
  <div className="relative inline-flex items-center">
    <div className="w-24 h-6 bg-gray-200 rounded-full relative">
      <div
        className={`absolute w-8 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 top-0.5 ${
          unit === 'hours' ? 'left-0.5' : unit === 'days' ? 'left-8' : 'left-[3.75rem]'
        }`}
      />
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <button
          onClick={() => onChange('hours')}
          className={`w-8 h-full flex items-center justify-center text-xs font-medium ${
            unit === 'hours' ? 'text-emerald-600 z-10' : 'text-gray-500'
          }`}
        >
          H
        </button>
        <button
          onClick={() => onChange('days')}
          className={`w-8 h-full flex items-center justify-center text-xs font-medium ${
            unit === 'days' ? 'text-emerald-600 z-10' : 'text-gray-500'
          }`}
        >
          D
        </button>
        <button
          onClick={() => onChange('weeks')}
          className={`w-8 h-full flex items-center justify-center text-xs font-medium ${
            unit === 'weeks' ? 'text-emerald-600 z-10' : 'text-gray-500'
          }`}
        >
          W
        </button>
      </div>
    </div>
  </div>
);

export default function HolidayPaySection({ holidayPay, onChange }: HolidayPaySectionProps) {
  const handleInputChange = (
    category: keyof HolidayPay,
    field: 'time' | 'rate' | 'unit',
    value: string | 'hours' | 'days' | 'weeks'
  ) => {
    const item = holidayPay[category];
    const time = field === 'time' ? value : item.time;
    const rate = field === 'rate' ? value : item.rate;
    
    // Calculate total whenever time or rate changes
    const total = (parseFloat(time || '0') * parseFloat(rate || '0')).toFixed(2);

    onChange({
      ...holidayPay,
      [category]: {
        ...item,
        [field]: value,
        total
      }
    });
  };

  const getTooltip = (category: keyof HolidayPay): string => {
    switch (category) {
      case 'annualLeave':
        return 'Annual leave is your main holiday entitlement. You get at least 4 weeks of annual holidays after each 12 months of continuous employment.';
      case 'other':
        return 'Other holiday-related payments such as holiday pay on termination or payment for holidays worked.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-800">Holiday Pay</h3>
        <Tooltip content="Holiday pay includes annual leave entitlements and related payments. The rate is calculated as the greater of your ordinary weekly pay or average weekly earnings over the last 12 months." />
      </div>
      <div className="overflow-visible">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-visible shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Time
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-1">
                      Unit
                      <div className="relative" style={{ zIndex: 20 }}>
                        <Tooltip content="Choose the unit that matches your payslip. Hours for hourly-paid leave, days for daily rates, or weeks for annual leave payments." position="top" />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Rate ($/unit)
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(Object.entries(holidayPay) as [keyof HolidayPay, any][]).map(([category, value]) => (
                  <tr key={category}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div className="flex items-center gap-1">
                        {category === 'annualLeave' ? 'Annual Leave' : 'Other'}
                        <Tooltip content={getTooltip(category)} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input
                        type="number"
                        value={value.time}
                        onChange={(e) => handleInputChange(category, 'time', e.target.value)}
                        className="w-20 sm:w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <UnitToggle
                        unit={value.unit}
                        onChange={(newUnit) => handleInputChange(category, 'unit', newUnit)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={value.rate}
                          onChange={(e) => handleInputChange(category, 'rate', e.target.value)}
                          className="w-24 sm:w-28 pl-7 pr-2 py-1 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">$</span>
                        <span>{value.total || '0.00'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}