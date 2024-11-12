import React from 'react';
import type { OtherEarnings } from '../types';
import Tooltip from './Tooltip';

interface OtherEarningsSectionProps {
  otherEarnings: OtherEarnings;
  onChange: (otherEarnings: OtherEarnings) => void;
}

export default function OtherEarningsSection({ otherEarnings, onChange }: OtherEarningsSectionProps) {
  const handleInputChange = (
    category: keyof OtherEarnings,
    total: string
  ) => {
    onChange({
      ...otherEarnings,
      [category]: {
        ...otherEarnings[category],
        total
      }
    });
  };

  const getTooltip = (key: keyof OtherEarnings): string => {
    switch (key) {
      case 'taxedAllowance':
        return 'Allowances that are taxed and usually included in leave calculations';
      case 'untaxedAllowance':
        return 'Allowances that are not taxed and usually excluded from leave calculations';
      case 'bonus':
        return 'One-off or periodic performance-based payments';
      case 'commission':
        return 'Sales or performance-based earnings';
      case 'other':
        return 'Any other earnings not covered by the categories above';
      default:
        return '';
    }
  };

  const items = [
    { key: 'taxedAllowance' as const, label: 'Allowance (Taxed)' },
    { key: 'untaxedAllowance' as const, label: 'Allowance (Untaxed)' },
    { key: 'bonus' as const, label: 'Bonus' },
    { key: 'commission' as const, label: 'Commission' },
    { key: 'other' as const, label: 'Other' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-800">4. Other Earnings</h3>
        <Tooltip content="Additional payments beyond your regular wages" />
      </div>
      <div className="overflow-x-visible relative">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(({ key, label }) => (
              <tr key={key} className="relative">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-1">
                    {label}
                    <div className="relative z-10">
                      <Tooltip content={getTooltip(key)} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={otherEarnings[key].total}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-32 px-2 py-1 border border-gray-300 rounded-md"
                    step="0.01"
                    min="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}