import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { PayRate, LeaveUnit } from '../types';
import PayRateDisplay from './PayRateDisplay';

interface ComparisonViewProps {
  bapsLeaveRate: PayRate;
  holidayPayRate: PayRate;
  normalPayRate: PayRate;
  ytdAverageRate: PayRate;
  leaveUnit: LeaveUnit;
  averageHoursPerDay: number;
  averageDaysPerWeek: number;
}

export default function ComparisonView({
  bapsLeaveRate,
  holidayPayRate,
  normalPayRate,
  ytdAverageRate,
  leaveUnit,
  averageHoursPerDay,
  averageDaysPerWeek,
}: ComparisonViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const ComparisonRow = ({ label, paidRate, normalRate, ytdRate }: {
    label: string;
    paidRate: PayRate;
    normalRate: PayRate;
    ytdRate: PayRate;
  }) => {
    const isCompliant = paidRate.amount >= Math.max(normalRate.amount, ytdRate.amount);
    
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="font-medium text-gray-800">{label}</div>
          <PayRateDisplay rate={paidRate} label="Paid Rate" />
          <PayRateDisplay rate={normalRate} label="Normal Rate" />
          <PayRateDisplay rate={ytdRate} label="YTD Average" />
          <div className="flex items-center gap-2">
            {isCompliant ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="text-lg font-semibold text-gray-800">Rate Comparison Summary</h3>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        <div className="mt-4 space-y-4">
          <ComparisonRow
            label="BAPS Leave"
            paidRate={bapsLeaveRate}
            normalRate={normalPayRate}
            ytdRate={ytdAverageRate}
          />
          <ComparisonRow
            label="Holiday Pay"
            paidRate={holidayPayRate}
            normalRate={normalPayRate}
            ytdRate={ytdAverageRate}
          />
        </div>

        {isExpanded && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Calculation Details</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <p>
                  BAPS Leave effective {leaveUnit} value = (Leave paid total) / (Leave {leaveUnit}s)
                </p>
                <p>Average hours per day: {averageHoursPerDay}</p>
                <p>Average days per week: {averageDaysPerWeek}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">YTD Average Rates</h4>
                <ul className="text-sm text-gray-600">
                  <li>Weekly: ${(ytdAverageRate.amount * 40).toFixed(2)}</li>
                  <li>Daily: ${(ytdAverageRate.amount * 8).toFixed(2)}</li>
                  <li>Hourly: ${ytdAverageRate.amount.toFixed(2)}</li>
                </ul>
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  Note: This is an estimated average based on limited data and may not reflect the full calculation required by law.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Normal Pay Rates</h4>
                <ul className="text-sm text-gray-600">
                  <li>Weekly: ${(normalPayRate.amount * 40).toFixed(2)}</li>
                  <li>Daily: ${(normalPayRate.amount * 8).toFixed(2)}</li>
                  <li>Hourly: ${normalPayRate.amount.toFixed(2)}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Help & Support</h4>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>If your pay looks incorrect, check with your boss or payroll team first to explain the calculation.</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>Reach out for help from a trusted leader at work or your union for additional support.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}