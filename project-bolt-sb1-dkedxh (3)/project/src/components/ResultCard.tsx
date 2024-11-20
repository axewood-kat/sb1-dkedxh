import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ResultCardProps {
  title: string;
  amount: number;
  description: string;
  comparison?: number;
  comparisonLabel?: string;
}

export default function ResultCard({ 
  title, 
  amount, 
  description, 
  comparison, 
  comparisonLabel 
}: ResultCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-emerald-600 mb-2">
        ${amount.toFixed(2)} NZD
      </p>
      {comparison !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>{comparisonLabel}:</span>
          <span className="font-medium">${comparison.toFixed(2)} NZD</span>
          {comparison > amount && (
            <div className="flex items-center gap-1 text-amber-600">
              <ArrowRight className="h-4 w-4" />
              <span className="font-medium">Higher than current average</span>
            </div>
          )}
        </div>
      )}
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}