import React from 'react';
import { Calendar, Heartbeat, Users, Shield, Sun, Clock } from 'lucide-react';
import type { LeaveEntitlements, LeaveUnit } from '../types';
import { formatLeaveBalance } from '../utils/leaveCalculations';

interface LeaveEntitlementsDisplayProps {
  entitlements: LeaveEntitlements;
  weeklyRate: number;
  onUnitChange: (unit: LeaveUnit) => void;
  selectedUnit: LeaveUnit;
}

export default function LeaveEntitlementsDisplay({
  entitlements,
  weeklyRate,
  onUnitChange,
  selectedUnit,
}: LeaveEntitlementsDisplayProps) {
  const leaveTypes = [
    { 
      icon: Calendar, 
      label: 'Annual Leave',
      value: entitlements.annualLeave,
      description: 'Minimum 4 weeks per year',
      color: 'text-emerald-600',
    },
    { 
      icon: Heartbeat, 
      label: 'Sick Leave',
      value: entitlements.sickLeave,
      description: '10 days per year after 6 months',
      color: 'text-blue-600',
    },
    { 
      icon: Users, 
      label: 'Bereavement Leave',
      value: entitlements.bereavementLeave,
      description: '3 days for immediate family',
      color: 'text-purple-600',
    },
    { 
      icon: Shield, 
      label: 'Family Violence Leave',
      value: entitlements.familyViolenceLeave,
      description: '10 days per year',
      color: 'text-red-600',
    },
    { 
      icon: Sun, 
      label: 'Public Holidays',
      value: entitlements.publicHolidays,
      description: '~11 days per year',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Leave Entitlements</h3>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <select
            value={selectedUnit}
            onChange={(e) => onUnitChange(e.target.value as LeaveUnit)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="hour">Hours</option>
            <option value="day">Days</option>
            <option value="week">Weeks</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {leaveTypes.map((leave) => (
          <div
            key={leave.label}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <leave.icon className={`h-5 w-5 mt-1 ${leave.color}`} />
              <div>
                <h4 className="font-medium text-gray-800">{leave.label}</h4>
                <p className="text-sm text-gray-500 mb-2">{leave.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-gray-800">
                    {formatLeaveBalance(leave.value)}
                  </span>
                  <span className="text-sm text-gray-500">
                    @ ${(weeklyRate / (selectedUnit === 'hour' ? 40 : selectedUnit === 'day' ? 5 : 1)).toFixed(2)}/{selectedUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}