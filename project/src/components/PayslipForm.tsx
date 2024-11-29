import React, { useState } from 'react';
import { Calculator, Upload, Table } from 'lucide-react';
import type { PayslipData } from '../types';
import PayPeriodSection from './PayPeriodSection';
import WorkedTimeSection from './WorkedTimeSection';
import BAPSLeaveSection from './BAPSLeaveSection';
import HolidayPaySection from './HolidayPaySection';
import YTDSection from './YTDSection';
import EmploymentConditionsSection from './EmploymentConditionsSection';
import ResultsDisplay from './ResultsDisplay';

const initialPayslipData: PayslipData = {
  payPeriod: {
    startDate: '',
    endDate: ''
  },
  workedTime: {
    workedTime: { hours: '', rate: '', total: '' },
    overtime: { hours: '', rate: '', total: '' },
    other: { hours: '', rate: '', total: '' }
  },
  bapsLeave: {
    sickLeave: { time: '', rate: '', unit: 'hours', total: '' },
    publicHolidays: { time: '', rate: '', unit: 'hours', total: '' },
    other: { time: '', rate: '', unit: 'hours', total: '' }
  },
  holidayPay: {
    annualLeave: { time: '', rate: '', unit: 'hours', total: '' },
    other: { time: '', rate: '', unit: 'hours', total: '' }
  },
  ytdEarnings: {
    total: ''
  },
  employmentConditions: {
    hoursPerDay: '8',
    daysPerWeek: '5',
    startDate: '',
    ordinaryPay: {
      amount: '',
      type: 'hourly',
      allowBelowMinimum: false
    }
  }
};

export default function PayslipForm() {
  const [payslipData, setPayslipData] = useState<PayslipData>(initialPayslipData);
  const [showResults, setShowResults] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'csv' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        
        // Basic CSV validation
        if (rows.length < 2) {
          setErrors({ csv: 'Invalid CSV format' });
          return;
        }

        // Map CSV data to payslip structure
        const data = mapCSVToPayslip(rows);
        setPayslipData(data);
        setErrors({});
      } catch (error) {
        setErrors({ csv: 'Failed to parse CSV file' });
      }
    };
    reader.readAsText(file);
  };

  const mapCSVToPayslip = (rows: string[][]): PayslipData => {
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const values = rows[1];
    const data = { ...initialPayslipData };

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';

      switch (header) {
        case 'start date':
          data.payPeriod.startDate = value;
          break;
        case 'end date':
          data.payPeriod.endDate = value;
          break;
        case 'hours worked':
          data.workedTime.workedTime.hours = value;
          break;
        case 'hourly rate':
          data.workedTime.workedTime.rate = value;
          break;
        case 'ytd earnings':
          data.ytdEarnings.total = value;
          break;
        // Add more mappings as needed
      }
    });

    return data;
  };

  const handleSubmit = () => {
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!payslipData.payPeriod.startDate || !payslipData.payPeriod.endDate) {
      newErrors.payPeriod = 'Pay period dates are required';
    }

    if (Object.keys(newErrors).length === 0) {
      setShowResults(true);
      setErrors({});
    } else {
      setErrors(newErrors);
      setShowResults(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!inputMethod ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Input Method</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => setInputMethod('manual')}
              className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Calculator className="h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">Manual Entry</h3>
              <p className="text-sm text-gray-600 text-center mt-2">
                Enter your payslip details manually using our form
              </p>
            </button>

            <button
              onClick={() => setInputMethod('csv')}
              className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Table className="h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">CSV Upload</h3>
              <p className="text-sm text-gray-600 text-center mt-2">
                Upload a CSV file exported from your payroll system
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {inputMethod === 'csv' && (
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Upload className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-800">Upload CSV File</h2>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-emerald-50 file:text-emerald-700
                  hover:file:bg-emerald-100"
              />
              {errors.csv && (
                <p className="mt-2 text-sm text-red-600">{errors.csv}</p>
              )}
              <div className="mt-4 text-sm text-gray-600">
                <a 
                  href="/template.csv" 
                  download 
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  Download CSV template
                </a>
              </div>
            </div>
          )}

          <EmploymentConditionsSection
            conditions={payslipData.employmentConditions}
            onChange={(data) => setPayslipData(prev => ({ ...prev, employmentConditions: data }))}
          />

          <PayPeriodSection
            startDate={payslipData.payPeriod.startDate}
            endDate={payslipData.payPeriod.endDate}
            onChange={(field, value) => setPayslipData(prev => ({
              ...prev,
              payPeriod: { ...prev.payPeriod, [field]: value }
            }))}
          />

          <WorkedTimeSection
            workedTime={payslipData.workedTime}
            onChange={(data) => setPayslipData(prev => ({ ...prev, workedTime: data }))}
            ordinaryPay={payslipData.employmentConditions.ordinaryPay}
          />

          <BAPSLeaveSection
            bapsLeave={payslipData.bapsLeave}
            onChange={(data) => setPayslipData(prev => ({ ...prev, bapsLeave: data }))}
          />

          <HolidayPaySection
            holidayPay={payslipData.holidayPay}
            onChange={(data) => setPayslipData(prev => ({ ...prev, holidayPay: data }))}
          />

          <YTDSection
            ytdEarnings={payslipData.ytdEarnings}
            onChange={(data) => setPayslipData(prev => ({ ...prev, ytdEarnings: data }))}
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Calculate Leave Entitlements
          </button>

          {showResults && (
            <ResultsDisplay
              data={payslipData}
              hoursPerDay={Number(payslipData.employmentConditions.hoursPerDay)}
              daysPerWeek={Number(payslipData.employmentConditions.daysPerWeek)}
            />
          )}
        </div>
      )}
    </div>
  );
}