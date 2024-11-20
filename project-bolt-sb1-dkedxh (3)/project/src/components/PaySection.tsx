import React from 'react';
import type { PayElement, PayUnit } from '../types';

interface PayRowProps {
  label: string;
  name: string;
  amount: string;
  unit: PayUnit;
  total: string;
  hint?: string;
  onChange: (name: string, value: Partial<PayElement>) => void;
}

const PayRow: React.FC<PayRowProps> = ({
  label,
  name,
  amount,
  unit,
  total,
  hint,
  onChange
}) => (
  <tr>
    <td className="py-2">
      <div className="text-sm text-gray-900">{label}</div>
      {hint && <div className="text-xs text-gray-500">{hint}</div>}
    </td>
    <td className="py-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => onChange(name, { amount: e.target.value })}
        className="w-full px-2 py-1 border border-gray-300 rounded"
        step="0.01"
        min="0"
      />
    </td>
    <td className="py-2">
      <select
        value={unit}
        onChange={(e) => onChange(name, { unit: e.target.value as PayUnit })}
        className="w-full px-2 py-1 border border-gray-300 rounded"
      >
        <option value="hour">Hours</option>
        <option value="day">Days</option>
        <option value="week">Weeks</option>
        <option value="fixed">Fixed</option>
      </select>
    </td>
    <td className="py-2">
      <input
        type="number"
        value={total}
        onChange={(e) => onChange(name, { total: e.target.value })}
        className="w-full px-2 py-1 border border-gray-300 rounded"
        step="0.01"
        min="0"
      />
    </td>
  </tr>
);

interface PaySectionProps {
  title: string;
  rows: Array<{
    label: string;
    name: string;
    amount: string;
    unit: PayUnit;
    total: string;
    hint?: string;
  }>;
  onChange: (name: string, value: Partial<PayElement>) => void;
}

export const PaySection: React.FC<PaySectionProps> = ({ title, rows, onChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left text-sm font-medium text-gray-500">Item</th>
          <th className="text-left text-sm font-medium text-gray-500">Amount</th>
          <th className="text-left text-sm font-medium text-gray-500">Unit</th>
          <th className="text-left text-sm font-medium text-gray-500">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <PayRow key={row.name} {...row} onChange={onChange} />
        ))}
      </tbody>
    </table>
  </div>
);