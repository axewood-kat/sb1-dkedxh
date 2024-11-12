import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { PayslipData } from '../types';
import PayPeriodSection from './PayPeriodSection';
import WorkedTimeSection from './WorkedTimeSection';
import BAPSLeaveSection from './BAPSLeaveSection';
import HolidayPaySection from './HolidayPaySection';
import YTDSection from './YTDSection';
import EmploymentConditionsSection from './EmploymentConditionsSection';
import ResultsDisplay from './ResultsDisplay';
import DonateButton from './DonateButton';
import { validateForm } from '../utils/validations';
import { calculateWorkedTimeRate } from '../utils/calculations';

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

export default function PayslipCalculator() {
  const [payslipData, setPayslipData] = useState<PayslipData>(initialPayslipData);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const handleSectionChange = <K extends keyof PayslipData>(
    section: K,
    data: PayslipData[K]
  ) => {
    setPayslipData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const calculateWorkedTimeRateFromData = (): number => {
    const { workedTime } = payslipData.workedTime;
    if (!workedTime.hours || !workedTime.rate) return 0;

    return parseFloat(workedTime.rate);
  };

  const calculateYTDHourlyRate = (): number => {
    const ytdTotal = parseFloat(payslipData.ytdEarnings.total);
    if (!ytdTotal) return 0;

    const hoursPerDay = Number(payslipData.employmentConditions.hoursPerDay);
    const daysPerWeek = Number(payslipData.employmentConditions.daysPerWeek);
    const hoursPerWeek = hoursPerDay * daysPerWeek;
    const weeksPerYear = 52;
    
    return ytdTotal / (weeksPerYear * hoursPerWeek);
  };

  const handleCalculate = () => {
    const validationErrors = validateForm(payslipData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setShowResults(true);
      setIsErrorVisible(false);
    } else {
      setShowResults(false);
      setIsErrorVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {isErrorVisible && Object.keys(errors).length > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mx-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.entries(errors).map(([key, value]) => {
                    if (typeof value === 'string') {
                      return <li key={key}>{value}</li>;
                    } else if (typeof value === 'object') {
                      return Object.entries(value).map(([subKey, subValue]) => (
                        <li key={`${key}-${subKey}`}>{subValue}</li>
                      ));
                    }
                    return null;
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-8">
        <EmploymentConditionsSection
          conditions={payslipData.employmentConditions}
          onChange={(data) => handleSectionChange('employmentConditions', data)}
        />

        <PayPeriodSection
          startDate={payslipData.payPeriod.startDate}
          endDate={payslipData.payPeriod.endDate}
          onChange={(field, value) => handleSectionChange('payPeriod', {
            ...payslipData.payPeriod,
            [field]: value
          })}
        />

        <WorkedTimeSection
          workedTime={payslipData.workedTime}
          onChange={(data) => handleSectionChange('workedTime', data)}
          ordinaryPay={payslipData.employmentConditions.ordinaryPay}
        />

        <BAPSLeaveSection
          bapsLeave={payslipData.bapsLeave}
          onChange={(data) => handleSectionChange('bapsLeave', data)}
        />

        <HolidayPaySection
          holidayPay={payslipData.holidayPay}
          onChange={(data) => handleSectionChange('holidayPay', data)}
        />

        <YTDSection
          ytdEarnings={payslipData.ytdEarnings}
          onChange={(data) => handleSectionChange('ytdEarnings', data)}
        />

        <button
          onClick={handleCalculate}
          className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
        >
          Check my pay
        </button>

        {showResults && (
          <>
            <ResultsDisplay
              data={payslipData}
              workedTimeRate={calculateWorkedTimeRateFromData()}
              ytdHourlyRate={calculateYTDHourlyRate()}
              hoursPerDay={Number(payslipData.employmentConditions.hoursPerDay)}
              daysPerWeek={Number(payslipData.employmentConditions.daysPerWeek)}
            />
            <DonateButton show={true} />
          </>
        )}
      </div>
    </div>
  );
}