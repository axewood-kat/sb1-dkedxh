import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { PayslipData } from '../types';
import { convertToHours } from '../utils/calculations';

interface PayAnalysisPDFProps {
  data: PayslipData;
  workedTimeRate?: number;
  ytdHourlyRate?: number;
  hoursPerDay: number;
  daysPerWeek: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#1f2937',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#4b5563',
  },
  value: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  disclaimer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff8e1',
    borderRadius: 4,
  },
  disclaimerTitle: {
    fontSize: 14,
    color: '#b45309',
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#92400e',
    lineHeight: 1.4,
  },
  comparisonTable: {
    marginTop: 10,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    marginBottom: 5,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});

const LeaveRateSection = ({ 
  title, 
  items, 
  itemLabels, 
  workedTimeRate = 0,
  ytdHourlyRate = 0,
  hoursPerDay,
  daysPerWeek,
}: {
  title: string;
  items: Record<string, { amount: string; unitType: string; total: string }>;
  itemLabels: Record<string, string>;
  workedTimeRate?: number;
  ytdHourlyRate?: number;
  hoursPerDay: number;
  daysPerWeek: number;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {Object.entries(items).map(([key, item]) => {
      if (!item.amount || !item.total) return null;
      
      const hoursAmount = convertToHours(item.amount, item.unitType, hoursPerDay, daysPerWeek);
      const paidHourlyRate = parseFloat(item.total) / hoursAmount;
      
      return (
        <View key={key} style={styles.comparisonTable}>
          <Text style={[styles.label, { marginBottom: 5 }]}>{itemLabels[key]}</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Rate Type</Text>
            <Text style={styles.tableCell}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Paid Rate</Text>
            <Text style={styles.tableCell}>${paidHourlyRate.toFixed(2)}/hour</Text>
          </View>
          {workedTimeRate > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Worked Time Rate</Text>
              <Text style={styles.tableCell}>${workedTimeRate.toFixed(2)}/hour</Text>
            </View>
          )}
          {ytdHourlyRate > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>YTD Average Rate</Text>
              <Text style={styles.tableCell}>${ytdHourlyRate.toFixed(2)}/hour</Text>
            </View>
          )}
        </View>
      );
    })}
  </View>
);

const PayAnalysisPDF: React.FC<PayAnalysisPDFProps> = ({
  data,
  workedTimeRate = 0,
  ytdHourlyRate = 0,
  hoursPerDay,
  daysPerWeek,
}) => {
  const bapsLabels = {
    sickLeave: 'Sick Leave',
    publicHolidays: 'Public Holidays',
    other: 'Other BAPS Leave'
  };

  const holidayLabels = {
    annualLeave: 'Annual Leave',
    other: 'Other Holiday Pay'
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Pay Analysis Report</Text>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          {workedTimeRate > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Worked Time Rate:</Text>
              <Text style={styles.value}>${workedTimeRate.toFixed(2)}/hour</Text>
            </View>
          )}
          {ytdHourlyRate > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>YTD Average Rate:</Text>
              <Text style={styles.value}>${ytdHourlyRate.toFixed(2)}/hour</Text>
            </View>
          )}
        </View>

        {/* BAPS Leave Analysis */}
        <LeaveRateSection
          title="BAPS Leave Analysis"
          items={data.bapsLeave}
          itemLabels={bapsLabels}
          workedTimeRate={workedTimeRate}
          ytdHourlyRate={ytdHourlyRate}
          hoursPerDay={hoursPerDay}
          daysPerWeek={daysPerWeek}
        />

        {/* Holiday Pay Analysis */}
        <LeaveRateSection
          title="Holiday Pay Analysis"
          items={data.holidayPay}
          itemLabels={holidayLabels}
          workedTimeRate={workedTimeRate}
          ytdHourlyRate={ytdHourlyRate}
          hoursPerDay={hoursPerDay}
          daysPerWeek={daysPerWeek}
        />

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            The calculations shown are estimates based on the information provided and standard calculation methods. 
            Actual entitlements may vary based on your specific employment agreement terms, additional factors not 
            captured in this calculator, and special circumstances or arrangements.
          </Text>
          <Text style={[styles.disclaimerText, { marginTop: 10 }]}>
            For accurate assessment of your entitlements, please consult with your employer, HR department, 
            or seek professional advice.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PayAnalysisPDF;