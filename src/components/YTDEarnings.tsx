import React from 'react';
import { DollarSign, Calendar } from 'lucide-react';

interface YTDEarningsProps {
  ytdEarnings: string;
  startDate: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function YTDEarnings({ ytdEarnings, startDate, onChange }: YTDEarningsProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Year to Date Earnings</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>YTD Gross Earnings (NZD)</span>
            </div>
          </label>
          <input
            type="number"
            name="ytdEarnings"
            value={ytdEarnings}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Tax Year Start Date</span>
            </div>
          </label>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
      </div>
    </div>
  );
}