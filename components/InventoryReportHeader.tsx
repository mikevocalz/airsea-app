import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { InventoryReport } from '@/types';
import Colors from '@/constants/colors';

interface InventoryReportHeaderProps {
  report: InventoryReport;
}

export default function InventoryReportHeader({ report }: InventoryReportHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {report.company.logoUrl ? (
          <Image source={{ uri: report.company.logoUrl }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>{report.company.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.reportTitle}>INVENTORY REPORT</Text>
          <Text style={styles.companyName}>{report.company.name}</Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Job #:</Text>
          <Text style={styles.metaValue}>{report.job.jobNumber}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Client:</Text>
          <Text style={styles.metaValue}>{report.job.client}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Project:</Text>
          <Text style={styles.metaValue}>{report.job.projectName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Generated:</Text>
          <Text style={styles.metaValue}>{formatDate(report.meta.generatedAt)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.text,
    marginBottom: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  titleContainer: {
    gap: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 1.5,
  },
  companyName: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  metaValue: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '600' as const,
    minWidth: 100,
  },
});
