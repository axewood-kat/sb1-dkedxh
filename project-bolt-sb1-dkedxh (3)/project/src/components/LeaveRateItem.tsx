import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import type { PayItem, BAPSLeaveItem } from '../types';
import { calculateHolidayPayRates, calculateLeaveRate, convertToHours } from '../utils/calculations';

interface LeaveRateItemProps {
  label: string;
  leaveItem: PayItem | BAPSLeaveItem;
  workedTimeRate: number;
  ytdEarnings: number;
  startDate: string;
  endDate: string;
  hoursPerDay: number;
  daysPerWeek: number;
  type: 'baps' | 'holiday';
  ordinaryPay?: {
    amount: string;
    type: 'hourly' | 'annual';
    allowBelowMinimum: boolean;
  };
}

export default function LeaveRateItem({
  label,
  leaveItem,
  workedTimeRate,
  ytdEarnings,
  startDate,
  endDate,
  hoursPerDay,
  daysPerWeek,
  type,
  ordinaryPay,
}: LeaveRateItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getComparisonRates = () => {
    if (type === 'holiday') {
      const { owp, awe, useEstimatedOWP } = calculateHolidayPayRates(
        workedTimeRate,
        ytdEarnings || 0,
        startDate,
        endDate,
        hoursPerDay,
        daysPerWeek,
        undefined,
        ordinaryPay
      );
      
      return {
        owp,
        awe,
        selected: owp.weekly > awe.weekly ? 'owp' : 'awe',
        useEstimatedOWP
      };
    } else {
      const { rdp, adp, useRDP } = calculateLeaveRate(
        leaveItem as PayItem,
        workedTimeRate,
        ytdEarnings || 0,
        hoursPerDay,
        daysPerWeek,
        undefined,
        ordinaryPay
      );
      
      return {
        rdp,
        adp,
        selected: useRDP ? 'rdp' : 'adp'
      };
    }
  };

  const comparison = getComparisonRates();
  const hoursAmount = 'time' in leaveItem 
    ? (leaveItem.unit === 'hours' ? parseFloat(leaveItem.time) : parseFloat(leaveItem.time) * hoursPerDay)
    : convertToHours(leaveItem.amount, leaveItem.unitType, hoursPerDay, daysPerWeek);
  const paidTotal = parseFloat(leaveItem.total || '0');
  const paidHourlyRate = paidTotal / hoursAmount;

  // Calculate required total based on the higher rate
  const requiredTotal = (() => {
    if (type === 'holiday') {
      const requiredRate = Math.max(comparison.owp.hourly, comparison.awe.hourly);
      return hoursAmount * requiredRate;
    } else {
      const requiredRate = comparison.selected === 'rdp' ? 
        comparison.rdp.hourly : 
        comparison.adp.hourly;
      return hoursAmount * requiredRate;
    }
  })();

  const difference = requiredTotal - paidTotal;
  const isCompliant = type === 'holiday' 
    ? paidHourlyRate >= Math.max(comparison.owp.hourly, comparison.awe.hourly)
    : paidHourlyRate >= (comparison.selected === 'rdp' ? comparison.rdp.hourly : comparison.adp.hourly);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-800">{label}</h4>
          {isCompliant ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          Paid rate: ${paidHourlyRate.toFixed(2)}/hour
        </p>
        {type === 'holiday' ? (
          <p>
            Required rate: ${Math.max(comparison.owp.hourly, comparison.awe.hourly).toFixed(2)}/hour
            ({comparison.selected === 'owp' ? 
              (comparison.useEstimatedOWP ? 'Estimated OWP' : 'OWP') : 
              'YTD AWE (estimated)'})
          </p>
        ) : (
          <p>
            Required rate: ${(comparison.selected === 'rdp' ? comparison.rdp.hourly : comparison.adp.hourly).toFixed(2)}/hour
            ({comparison.selected === 'rdp' ? 'RDP' : 'YTD ADP (estimated)'})
          </p>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {type === 'holiday' ? (
              <>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">
                    {comparison.useEstimatedOWP ? 'Estimated OWP' : 'Ordinary Weekly Pay'}
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p>Weekly: ${comparison.owp.weekly.toFixed(2)}</p>
                    <p>Daily: ${comparison.owp.daily.toFixed(2)}</p>
                    <p>Hourly: ${comparison.owp.hourly.toFixed(2)}</p>
                    {comparison.useEstimatedOWP && (
                      <p className="text-amber-600 mt-1">
                        Estimated from worked time rate due to limited pay history
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">YTD Average Weekly Earnings (AWE)</h5>
                  <div className="space-y-1 text-sm">
                    <p>Weekly: ${comparison.awe.weekly.toFixed(2)}</p>
                    <p>Daily: ${comparison.awe.daily.toFixed(2)}</p>
                    <p>Hourly: ${comparison.awe.hourly.toFixed(2)}</p>
                    {!ytdEarnings && (
                      <div className="flex items-start gap-2 mt-2 text-amber-600">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>Please add YTD earnings for more accurate calculations</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">Relevant Daily Pay (RDP)</h5>
                  <div className="space-y-1 text-sm">
                    <p>Weekly: ${comparison.rdp.weekly.toFixed(2)}</p>
                    <p>Daily: ${comparison.rdp.daily.toFixed(2)}</p>
                    <p>Hourly: ${comparison.rdp.hourly.toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">YTD Average Daily Pay (ADP)</h5>
                  <div className="space-y-1 text-sm">
                    <p>Weekly: ${comparison.adp.weekly.toFixed(2)}</p>
                    <p>Daily: ${comparison.adp.daily.toFixed(2)}</p>
                    <p>Hourly: ${comparison.adp.hourly.toFixed(2)}</p>
                    {!ytdEarnings && (
                      <div className="flex items-start gap-2 mt-2 text-amber-600">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>Please add YTD earnings for more accurate calculations</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
            <h5 className="font-medium text-gray-700">Calculation Details</h5>
            <div className="space-y-1 text-gray-600">
              <p>Work pattern: {hoursPerDay} hours/day, {daysPerWeek} days/week</p>
              <p>
                Time entered: {('time' in leaveItem ? leaveItem.time : leaveItem.amount)} {('unit' in leaveItem ? leaveItem.unit : leaveItem.unitType)} 
                {('unit' in leaveItem ? leaveItem.unit : leaveItem.unitType) !== 'hours' && ` (${hoursAmount.toFixed(1)} hours)`}
              </p>
              {type === 'holiday' ? (
                <>
                  <p>Using {comparison.selected.toUpperCase()} (higher of the two)</p>
                  {comparison.useEstimatedOWP && comparison.selected === 'owp' && (
                    <p className="text-amber-600">
                      Using estimated OWP from worked time rate due to less than 4 weeks of pay history
                    </p>
                  )}
                  {comparison.selected === 'awe' && (
                    <p className="text-amber-600">
                      Using YTD AWE as it is higher than the estimated OWP
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>Using {comparison.selected === 'rdp' ? 'RDP' : 'YTD ADP'}</p>
                  {comparison.selected === 'adp' && (
                    <p className="text-amber-600">
                      Using YTD ADP as RDP is not available or lower
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <h5 className="font-medium text-gray-700 mb-3">Payment Summary</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Amount Paid</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${paidTotal.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Required Amount</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${requiredTotal.toFixed(2)}
                </p>
              </div>
            </div>
            {!isCompliant && (
              <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                <p className="text-red-700 font-medium">
                  Underpayment: ${Math.abs(difference).toFixed(2)}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  The payment appears to be below the required rate
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}