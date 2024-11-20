import React from 'react';
import type { PayItem, BAPSLeaveItem } from '../types';
import LeaveRateItem from './LeaveRateItem';

interface LeaveRateBreakdownProps {
  title: string;
  items: Record<string, PayItem | BAPSLeaveItem>;
  itemLabels: Record<string, string>;
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

export default function LeaveRateBreakdown({
  title,
  items,
  itemLabels,
  workedTimeRate,
  ytdEarnings,
  startDate,
  endDate,
  hoursPerDay,
  daysPerWeek,
  type,
  ordinaryPay
}: LeaveRateBreakdownProps) {
  // Filter out items that don't have both amount/time and total
  const activeItems = Object.entries(items).filter(([_, item]) => {
    if ('time' in item) {
      return item.time && item.rate && parseFloat(item.time) > 0 && parseFloat(item.rate) > 0;
    } else {
      return item.amount && item.total && parseFloat(item.amount) > 0 && parseFloat(item.total) > 0;
    }
  });

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {activeItems.map(([key, item]) => (
          <LeaveRateItem
            key={key}
            label={itemLabels[key]}
            leaveItem={item}
            workedTimeRate={workedTimeRate}
            ytdEarnings={ytdEarnings}
            startDate={startDate}
            endDate={endDate}
            hoursPerDay={hoursPerDay}
            daysPerWeek={daysPerWeek}
            type={type}
            ordinaryPay={ordinaryPay}
          />
        ))}
      </div>
    </div>
  );
}