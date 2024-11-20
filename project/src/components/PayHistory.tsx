import React from 'react';
import { Trash2 } from 'lucide-react';
import type { PayPeriod } from '../types';

interface PayHistoryProps {
  periods: PayPeriod[];
  onRemove: (index: number) => void;
}

const PayHistory: React.FC<PayHistoryProps> = ({ periods, onRemove }) => {
  if (periods.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Pay History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regular Pay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {periods.map((period, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {period.startDate} - {period.endDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${period.regularPay.total || '0'} ({period.regularPay.amount} {period.regularPay.unit}s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {period.overtime.hours} hrs @ {period.overtime.rate}x
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  BAPS: ${parseFloat(period.bapsLeave.sick.total || '0') + 
                          parseFloat(period.bapsLeave.publicHoliday.total || '0') + 
                          parseFloat(period.bapsLeave.other.total || '0')}
                  <br />
                  Holiday: ${parseFloat(period.holidayPay.annual.total || '0') + 
                            parseFloat(period.holidayPay.other.total || '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayHistory;