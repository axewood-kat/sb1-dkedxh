import React from 'react';
import type { YTDEarnings } from '../types';

interface YTDSectionProps {
  ytdEarnings: YTDEarnings;
  onChange: (ytdEarnings: YTDEarnings) => void;
}

export default function YTDSection({ ytdEarnings, onChange }: YTDSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">5. YTD Earnings</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                YTD Gross Earnings (since April 1st)
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={ytdEarnings.total}
                  onChange={(e) => onChange({ total: e.target.value })}
                  className="w-32 px-2 py-1 border border-gray-300 rounded-md"
                  step="0.01"
                  min="0"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}