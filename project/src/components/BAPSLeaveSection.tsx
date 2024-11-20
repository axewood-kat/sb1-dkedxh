import React from 'react';
import type { BAPSLeave } from '../types';
import Tooltip from './Tooltip';

interface BAPSLeaveSectionProps {
  bapsLeave: BAPSLeave;
  onChange: (bapsLeave: BAPSLeave) => void;
}

const UnitToggle = ({ unit, onChange }: { unit: 'hours' | 'days'; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
      unit === 'hours' ? 'bg-emerald-600' : 'bg-blue-600'
    }`}
  >
    <span className="sr-only">Toggle time unit</span>
    <span
      className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        unit === 'hours' ? 'translate-x-6' : 'translate-x-0'
      }`}
    >
      <span
        className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
          unit === 'hours' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="text-blue-600 font-medium text-xs">D</span>
      </span>
      <span
        className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
          unit === 'hours' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-emerald-600 font-medium text-xs">H</span>
      </span>
    </span>
  </button>
);

export default function BAPSLeaveSection({ bapsLeave, onChange }: BAPSLeaveSectionProps) {
  const handleInputChange = (
    category: keyof BAPSLeave,
    field: 'time' | 'rate' | 'unit',
    value: string | 'hours' | 'days'
  ) => {
    const item = bapsLeave[category];
    const time = field === 'time' ? value : item.time;
    const rate = field === 'rate' ? value : item.rate;
    
    // Calculate total whenever time or rate changes
    const total = (parseFloat(time || '0') * parseFloat(rate || '0')).toFixed(2);

    onChange({
      ...bapsLeave,
      [category]: {
        ...item,
        [field]: value,
        total
      }
    });
  };

  const getTooltip = (category: keyof BAPSLeave): string => {
    switch (category) {
      case 'sickLeave':
        return 'Time taken off due to illness or injury. You are entitled to 10 days of sick leave per year after 6 months of continuous employment.';
      case 'publicHolidays':
        return 'Public holidays that fall during your normal working days. You are entitled to be paid for these days if they would normally be working days.';
      case 'other':
        return 'Other types of leave such as bereavement leave or family violence leave.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-800">BAPS Leave</h3>
        <Tooltip content="BAPS Leave includes Bereavement Leave, Alternative Holidays, Public Holidays, and Sick Leave. These are statutory entitlements under NZ employment law." />
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
                        <Tooltip content="Toggle between hours and days. Use the same unit as shown on your payslip for accurate calculations." position="top" />
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
                {(Object.entries(bapsLeave) as [keyof BAPSLeave, any][]).map(([category, value]) => (
                  <tr key={category}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div className="flex items-center gap-1">
                        {category === 'sickLeave' ? 'Sick Leave' : 
                         category === 'publicHolidays' ? 'Public Holidays' : 'Other'}
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
                        onChange={() => handleInputChange(
                          category,
                          'unit',
                          value.unit === 'hours' ? 'days' : 'hours'
                        )}
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