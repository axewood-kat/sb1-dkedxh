import React from 'react';
import { DollarSign } from 'lucide-react';
import type { PayRate } from '../types';

interface PayRateDisplayProps {
  rate: PayRate;
  label: string;
  className?: string;
}

export default function PayRateDisplay({ rate, label, className = '' }: PayRateDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">{label}:</span>
      <div className="flex items-center gap-1">
        <DollarSign className="h-4 w-4 text-emerald-500" />
        <span className="font-medium text-emerald-600">{rate.amount.toFixed(2)}</span>
      </div>
    </div>
  );
}