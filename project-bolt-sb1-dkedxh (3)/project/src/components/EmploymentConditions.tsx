import React from 'react';
import type { PayPeriod } from '../types';

interface EmploymentConditionsProps {
  conditions: PayPeriod['employmentConditions'];
  onChange: (conditions: PayPeriod['employmentConditions']) => void;
}

const EmploymentConditions: React.FC<EmploymentConditionsProps> = ({ conditions, onChange }) => (
  <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 mb-8">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Conditions</h2>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hours per Day
        </label>
        <input
          type="number"
          value={conditions.hoursPerDay}
          onChange={(e) => onChange({
            ...conditions,
            hoursPerDay: e.target.value
          })}
          className="w-full px-4 py-2 rounded-md border-gray-300"
          min="0"
          step="0.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Days per Week
        </label>
        <input
          type="number"
          value={conditions.daysPerWeek}
          onChange={(e) => onChange({
            ...conditions,
            daysPerWeek: e.target.value
          })}
          className="w-full px-4 py-2 rounded-md border-gray-300"
          min="0"
          max="7"
          step="0.5"
        />
      </div>
    </div>
  </div>
);

export default EmploymentConditions;