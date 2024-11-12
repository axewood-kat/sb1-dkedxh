import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Tooltip from './Tooltip';
import type { EmploymentConditions, OrdinaryPay } from '../types';
import { calculateHourlyRate, isAboveMinimumWage } from '../utils/calculations';

interface EmploymentConditionsSectionProps {
  conditions: EmploymentConditions;
  onChange: (conditions: EmploymentConditions) => void;
}

export default function EmploymentConditionsSection({ 
  conditions, 
  onChange 
}: EmploymentConditionsSectionProps) {
  const [localValues, setLocalValues] = useState<EmploymentConditions>(conditions);
  const [errors, setErrors] = useState<{
    hoursPerDay?: string;
    daysPerWeek?: string;
    ordinaryPay?: string;
  }>({});

  const validateField = (field: keyof EmploymentConditions, value: string): string | undefined => {
    if (field === 'startDate') return undefined;
    
    const numValue = Number(value);
    
    if (!value.trim()) {
      return undefined;
    }
    
    if (isNaN(numValue) || numValue <= 0) {
      return `${field === 'hoursPerDay' ? 'Hours per day' : 'Days per week'} must be a positive number`;
    }

    if (field === 'hoursPerDay' && numValue > 24) {
      return 'Hours per day cannot exceed 24';
    }

    if (field === 'daysPerWeek' && numValue > 7) {
      return 'Days per week cannot exceed 7';
    }

    return undefined;
  };

  const handleChange = (field: keyof EmploymentConditions, value: string | OrdinaryPay) => {
    if (field === 'startDate') {
      setLocalValues(prev => ({
        ...prev,
        startDate: value as string
      }));
      onChange({
        ...conditions,
        startDate: value as string
      });
      return;
    }

    if (field === 'ordinaryPay') {
      const ordinaryPay = value as OrdinaryPay;
      setLocalValues(prev => ({
        ...prev,
        ordinaryPay
      }));
      onChange({
        ...conditions,
        ordinaryPay
      });
      return;
    }

    // Allow empty field or valid decimal input
    if (value === '' || /^\d*\.?\d*$/.test(value as string)) {
      setLocalValues(prev => ({
        ...prev,
        [field]: value
      }));

      const error = validateField(field, value as string);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));

      // Only update parent if value is valid or empty (will use default)
      if (!error) {
        onChange({
          ...conditions,
          [field]: value || (field === 'hoursPerDay' ? '8' : '5') // Use default if empty
        });
      }
    }
  };

  const handleBlur = (field: keyof EmploymentConditions) => {
    if (field === 'startDate') return;
    
    const value = localValues[field];
    
    // If empty or invalid on blur, reset to default
    if (!value || errors[field]) {
      const defaultValue = field === 'hoursPerDay' ? '8' : '5';
      setLocalValues(prev => ({
        ...prev,
        [field]: defaultValue
      }));
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
      onChange({
        ...conditions,
        [field]: defaultValue
      });
    } else if (typeof value === 'string') {
      // Format number to at most 1 decimal place if needed
      const formattedValue = Number(value).toFixed(1);
      const finalValue = formattedValue.endsWith('.0') ? 
        formattedValue.slice(0, -2) : formattedValue;
      
      setLocalValues(prev => ({
        ...prev,
        [field]: finalValue
      }));
      onChange({
        ...conditions,
        [field]: finalValue
      });
    }
  };

  const handleOrdinaryPayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    const updatedOrdinaryPay: OrdinaryPay = {
      ...localValues.ordinaryPay || { amount: '', type: 'hourly', allowBelowMinimum: false },
      [name]: type === 'checkbox' ? checked : value
    };

    handleChange('ordinaryPay', updatedOrdinaryPay);
  };

  const showMinimumWageWarning = localValues.ordinaryPay && !localValues.ordinaryPay.allowBelowMinimum && 
    !isAboveMinimumWage(
      localValues.ordinaryPay,
      Number(localValues.hoursPerDay),
      Number(localValues.daysPerWeek)
    );

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Employment Conditions</h3>
        <Tooltip content="Your normal working days and hours. This helps calculate your entitlements accurately." />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Hours per Day
            </label>
            <Tooltip content="The number of hours you typically work in a standard work day" />
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={localValues.hoursPerDay}
            onChange={(e) => handleChange('hoursPerDay', e.target.value)}
            onBlur={() => handleBlur('hoursPerDay')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.hoursPerDay ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="8"
          />
          {errors.hoursPerDay && (
            <p className="mt-1 text-sm text-red-600">{errors.hoursPerDay}</p>
          )}
        </div>
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Days per Week
            </label>
            <Tooltip content="The number of days you typically work in a standard work week" />
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={localValues.daysPerWeek}
            onChange={(e) => handleChange('daysPerWeek', e.target.value)}
            onBlur={() => handleBlur('daysPerWeek')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.daysPerWeek ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="5"
          />
          {errors.daysPerWeek && (
            <p className="mt-1 text-sm text-red-600">{errors.daysPerWeek}</p>
          )}
        </div>
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Employment Start Date
            </label>
            <Tooltip content="If you started after 1 April, please include your start date to make your calculations more accurate" />
          </div>
          <input
            type="date"
            value={localValues.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Ordinary Pay Rate
          </label>
          <Tooltip content="Your standard pay rate. Can be entered as hourly rate or annual salary" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <select
              name="type"
              value={localValues.ordinaryPay?.type || 'hourly'}
              onChange={handleOrdinaryPayChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="hourly">Hourly Rate</option>
              <option value="annual">Annual Salary</option>
            </select>
          </div>
          <div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="amount"
                value={localValues.ordinaryPay?.amount || ''}
                onChange={handleOrdinaryPayChange}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={localValues.ordinaryPay?.type === 'hourly' ? '22.70' : '47,216'}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowBelowMinimum"
              checked={localValues.ordinaryPay?.allowBelowMinimum || false}
              onChange={handleOrdinaryPayChange}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-600">
              Allow below minimum wage
            </label>
          </div>
        </div>

        {showMinimumWageWarning && (
          <div className="mt-2 flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">
              This rate is below the minimum wage (${calculateHourlyRate(
                localValues.ordinaryPay!,
                Number(localValues.hoursPerDay),
                Number(localValues.daysPerWeek)
              ).toFixed(2)}/hour)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}