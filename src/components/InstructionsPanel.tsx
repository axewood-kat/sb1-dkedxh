import React, { useState } from 'react';
import { HelpCircle, X, FileText, Briefcase, Calculator, AlertCircle } from 'lucide-react';

interface InstructionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionsPanel({ isOpen, onClose }: InstructionsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-800">How to Use This Calculator</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <FileText className="h-5 w-5 text-emerald-600" />
              <h3>What You'll Need</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Your recent payslip</li>
              <li>Your employment agreement or contract</li>
              <li>Year-to-date (YTD) earnings (found on your payslip or from myIR)</li>
              <li>Details of any leave taken during the pay period</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <h3>Employment Details</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              <p>Start by entering your basic employment information:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Regular hours per day</li>
                <li>Regular days per week</li>
                <li>Employment start date (if after April 1st)</li>
                <li>Your ordinary pay rate (hourly or annual)</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Calculator className="h-5 w-5 text-emerald-600" />
              <h3>Entering Pay Information</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              <p>From your payslip, enter:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Regular hours worked and rate</li>
                <li>Any overtime hours and rate</li>
                <li>BAPS leave taken (sick leave, public holidays)</li>
                <li>Holiday pay received</li>
                <li>Year-to-date earnings</li>
              </ul>
            </div>
          </section>

          <section className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-emerald-800">Why Use This Calculator?</h4>
                <p className="text-emerald-700 text-sm">
                  This calculator helps you verify that your leave payments comply with NZ employment law. 
                  It compares your actual payments against required rates and highlights any discrepancies, 
                  giving you confidence that you're being paid correctly for your leave.
                </p>
              </div>
            </div>
          </section>

          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p>
              After entering your information, the calculator will analyze your leave payments and show 
              if they meet the required rates under NZ employment law. It will highlight any areas that 
              might need attention or discussion with your employer.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}