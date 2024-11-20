import React from 'react';
import type { WorkedTime, PayItem, EmploymentConditions } from '../types';
import Tooltip from './Tooltip';

interface WorkedTimeSectionProps {
  workedTime: WorkedTime;
  onChange: (workedTime: WorkedTime) => void;
  ordinaryPay?: EmploymentConditions['ordinaryPay'];
}

export default function WorkedTimeSection({ 
  workedTime, 
  onChange,
  ordinaryPay 
}: WorkedTimeSectionProps) {
  const handleInputChange = (
    category: keyof WorkedTime,
    field: keyof PayItem,
    value: string
  ) => {
    const item = workedTime[category];
    const hours = field === 'hours' ? value : item.hours;
    const rate = field === 'rate' ? value : item.rate;
    
    // Calculate total whenever hours or rate changes
    const total = (parseFloat(hours || '0') * parseFloat(rate || '0')).toFixed(2);

    onChange({
      ...workedTime,
      [category]: {
        ...item,
        [field]: value,
        total
      }
    });
  };

  const getDisplayLabel = (category: string): string => {
    switch (category) {
      case 'workedTime':
        return 'Regular Hours';
      case 'overtime':
        return 'Overtime';
      case 'other':
        return 'Other Hours';
      default:
        return category;
    }
  };

  const getTooltip = (category: string): string => {
    switch (category) {
      case 'workedTime':
        return 'Regular hours worked at your standard pay rate';
      case 'overtime':
        return 'Hours worked beyond your standard hours, usually paid at a higher rate';
      case 'other':
        return 'Any other hours worked under special conditions';
      default:
        return '';
    }
  };

  const isRateBelowOrdinary = (rate: string): boolean => {
    if (!ordinaryPay || !ordinaryPay.amount || !rate) return false;
    
    const rateNum = parseFloat(rate);
    const ordinaryAmount = parseFloat(ordinaryPay.amount);
    
    if (ordinaryPay.type === 'hourly') {
      return rateNum < ordinaryAmount;
    } else {
      // Convert annual to hourly based on standard hours
      const annualHourlyRate = ordinaryAmount / (52 * 40); // Assuming 52 weeks, 40 hours per week
      return rateNum < annualHourlyRate;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-800">Worked Time</h3>
        <Tooltip content="Record all hours worked during this pay period" />
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Hours
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Rate ($/hr)
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(Object.keys(workedTime) as Array<keyof WorkedTime>).map((category) => {
                  const item = workedTime[category];
                  const rateBelowOrdinary = isRateBelowOrdinary(item.rate);
                  
                  return (
                    <tr key={category}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <div className="flex items-center gap-1">
                          {getDisplayLabel(category)}
                          <div className="relative z-10">
                            <Tooltip content={getTooltip(category)} />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <input
                          type="number"
                          value={item.hours}
                          onChange={(e) => handleInputChange(category, 'hours', e.target.value)}
                          className="w-20 sm:w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleInputChange(category, 'rate', e.target.value)}
                            className={`w-24 sm:w-28 pl-7 pr-2 py-1 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 ${
                              rateBelowOrdinary ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                          />
                          {rateBelowOrdinary && (
                            <div className="absolute left-full ml-2 whitespace-nowrap">
                              <Tooltip content="Rate is below your ordinary pay rate" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">$</span>
                          <span>{item.total || '0.00'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}