import React from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import type { PayslipData } from '../types';
import { convertToHours } from '../utils/calculations';
import LeaveRateBreakdown from './LeaveRateBreakdown';

interface ResultsDisplayProps {
  data: PayslipData;
  workedTimeRate?: number;
  ytdHourlyRate?: number;
  hoursPerDay: number;
  daysPerWeek: number;
}

const ResultsSummary = ({
  workedTimeRate = 0,
  ytdHourlyRate = 0,
  ordinaryPayRate = 0,
  employmentStartDate = '',
}: {
  workedTimeRate: number;
  ytdHourlyRate: number;
  ordinaryPayRate: number;
  employmentStartDate?: string;
}) => {
  const rates = [
    { label: 'Worked Time Rate', value: workedTimeRate },
    { label: 'YTD Average Rate', value: ytdHourlyRate },
    { label: 'Ordinary Pay Rate', value: ordinaryPayRate },
  ].filter(rate => rate.value > 0);

  if (rates.length === 0) return null;

  const highestRate = Math.max(...rates.map(r => r.value));
  const lowestRate = Math.min(...rates.map(r => r.value));
  const difference = ((highestRate - lowestRate) / lowestRate) * 100;
  const hasSignificantDifference = difference > 5; // 5% threshold

  // Check if we're in a new tax year and no start date is provided
  const currentDate = new Date();
  const taxYearStart = new Date(currentDate.getFullYear(), 3, 1); // April 1st
  const isNewTaxYear = currentDate > taxYearStart && !employmentStartDate;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Rate Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rates.map(({ label, value }) => (
          <div key={label} className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">{label}</div>
            <div className="text-lg font-semibold text-gray-900">
              ${value.toFixed(2)}/hour
            </div>
          </div>
        ))}
      </div>

      {hasSignificantDifference && (
        <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Significant rate variation detected</p>
            <p className="mt-1">
              There is a {difference.toFixed(1)}% difference between your highest and lowest rates. 
              This might be worth discussing with your employer to understand the reasons for the variation.
            </p>
            {isNewTaxYear && (
              <p className="mt-2 text-amber-700">
                If you started employment after April 1st, adding your start date in the Employment Conditions 
                section will help provide more accurate YTD average calculations.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ResultsDisplay({ 
  data,
  workedTimeRate = 0,
  ytdHourlyRate = 0,
  hoursPerDay,
  daysPerWeek
}: ResultsDisplayProps) {
  const ordinaryPayRate = data.employmentConditions.ordinaryPay?.amount 
    ? parseFloat(data.employmentConditions.ordinaryPay.amount)
    : 0;

  return (
    <div className="space-y-8 mt-8">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pay Analysis Results</h2>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-700"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>
        
        <div className="space-y-6">
          <ResultsSummary 
            workedTimeRate={workedTimeRate}
            ytdHourlyRate={ytdHourlyRate}
            ordinaryPayRate={ordinaryPayRate}
            employmentStartDate={data.employmentConditions.startDate}
          />

          <LeaveRateBreakdown
            title="BAPS Leave Analysis"
            items={data.bapsLeave}
            itemLabels={{
              sickLeave: 'Sick Leave',
              publicHolidays: 'Public Holidays',
              other: 'Other BAPS Leave'
            }}
            workedTimeRate={workedTimeRate}
            ytdEarnings={parseFloat(data.ytdEarnings.total) || 0}
            startDate={data.payPeriod.startDate}
            endDate={data.payPeriod.endDate}
            hoursPerDay={hoursPerDay}
            daysPerWeek={daysPerWeek}
            type="baps"
            ordinaryPay={data.employmentConditions.ordinaryPay}
          />

          <LeaveRateBreakdown
            title="Holiday Pay Analysis"
            items={data.holidayPay}
            itemLabels={{
              annualLeave: 'Annual Leave',
              other: 'Other Holiday Pay'
            }}
            workedTimeRate={workedTimeRate}
            ytdEarnings={parseFloat(data.ytdEarnings.total) || 0}
            startDate={data.payPeriod.startDate}
            endDate={data.payPeriod.endDate}
            hoursPerDay={hoursPerDay}
            daysPerWeek={daysPerWeek}
            type="holiday"
            ordinaryPay={data.employmentConditions.ordinaryPay}
          />
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-amber-800">Important Disclaimer</h3>
            <div className="text-sm text-amber-700 space-y-2">
              <p>
                The calculations shown are estimates based on the information provided and standard calculation methods. 
                Actual entitlements may vary based on:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Your specific employment agreement terms</li>
                <li>Additional factors not captured in this calculator</li>
                <li>Special circumstances or arrangements</li>
              </ul>
              <p className="mt-4">
                For accurate assessment of your entitlements, please consult with your employer, HR department, 
                or seek professional advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}