const EmploymentConditions: React.FC<{
  conditions: PayPeriod['employmentConditions'];
  onChange: (conditions: PayPeriod['employmentConditions']) => void;
}> = ({ conditions, onChange }) => (
  <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Conditions</h3>
    <p className="text-sm text-gray-600 mb-4">These settings will be used for rate calculations across all payslips</p>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Hours per Day</label>
        <input
          type="number"
          value={conditions.hoursPerDay}
          onChange={(e) => onChange({ ...conditions, hoursPerDay: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          min="0"
          step="0.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Days per Week</label>
        <input
          type="number"
          value={conditions.daysPerWeek}
          onChange={(e) => onChange({ ...conditions, daysPerWeek: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          min="0"
          step="0.5"
          max="7"
        />
      </div>
    </div>
  </div>
);

// ... rest of the PayslipForm component remains the same until the YTD section

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">5. YTD Earnings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">YTD Gross Earnings (Total since April 1st)</label>
            <input
              type="number"
              value={payslip.ytdEarnings.total}
              onChange={(e) => onChange({
                ...payslip,
                ytdEarnings: {
                  ...payslip.ytdEarnings,
                  total: e.target.value
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <button
          onClick={onAdd}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Add Pay Period
        </button>
      </div>
    </div>
  );
};