import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Printer,
  Share2,
  FileText,
  Package,
  QrCode,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { sampleInventoryReport } from '@/mocks/inventoryData';
import { generateInventoryReportHTML, calculatePagination } from '@/utils/inventoryPdfGenerator';

export default function InventoryPDFScreen() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const report = sampleInventoryReport;

  const pagination = calculatePagination(report.items.length);
  const itemsWithPhotos = report.items.filter(item => item.media?.photoUrl).length;
  const itemsWithNotes = report.items.filter(item => item.notes).length;
  const itemsWithVideo = report.items.filter(item => item.handlingVideo).length;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      console.log('Generating inventory report HTML...');
      const html = generateInventoryReportHTML(report);
      console.log('Printing inventory report...');
      await Print.printAsync({ html });
      console.log('Print completed successfully');
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print document. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      console.log('Generating inventory report HTML for sharing...');
      const html = generateInventoryReportHTML(report);
      console.log('Converting to PDF...');
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF generated at:', uri);

      if (Platform.OS === 'web') {
        Alert.alert('Info', 'Sharing is not available on web. Use print instead.');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Share Inventory Report - ${report.job.jobNumber}`,
          });
        } else {
          Alert.alert('Info', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share document. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Export Report',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <FileText color={Colors.primary} size={24} />
              <Text style={styles.previewTitle}>Report Preview</Text>
            </View>

            <View style={styles.previewContent}>
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Job Number</Text>
                <Text style={styles.previewValue}>{report.job.jobNumber}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Client</Text>
                <Text style={styles.previewValue}>{report.job.client}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Project</Text>
                <Text style={styles.previewValue}>{report.job.projectName}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Total Items</Text>
                  <Text style={styles.previewValue}>{report.items.length}</Text>
                </View>
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Pages</Text>
                  <Text style={styles.previewValue}>{pagination.totalPages + itemsWithPhotos + itemsWithNotes}</Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Report ID</Text>
                <Text style={styles.previewValueMono}>{report.id}</Text>
              </View>
            </View>
          </View>

          <View style={styles.contentsCard}>
            <Text style={styles.contentsTitle}>PDF Contents</Text>

            <View style={styles.contentItem}>
              <View style={styles.contentIcon}>
                <Package color={Colors.primary} size={16} />
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentLabel}>Inventory Table</Text>
                <Text style={styles.contentDesc}>
                  {report.items.length} items with zebra striping
                </Text>
              </View>
              <CheckCircle color={Colors.success} size={18} />
            </View>

            <View style={styles.contentItem}>
              <View style={styles.contentIcon}>
                <QrCode color={Colors.accent} size={16} />
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentLabel}>QR Codes</Text>
                <Text style={styles.contentDesc}>
                  {itemsWithVideo} handling video QR codes
                </Text>
              </View>
              <CheckCircle color={Colors.success} size={18} />
            </View>

            <View style={styles.contentItem}>
              <View style={styles.contentIcon}>
                <ImageIcon color={Colors.primaryLight} size={16} />
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentLabel}>Detail Pages</Text>
                <Text style={styles.contentDesc}>
                  {itemsWithPhotos} items with photos/notes
                </Text>
              </View>
              <CheckCircle color={Colors.success} size={18} />
            </View>

            <View style={styles.contentItem}>
              <View style={styles.contentIcon}>
                <FileText color={Colors.text} size={16} />
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentLabel}>Header & Footer</Text>
                <Text style={styles.contentDesc}>
                  Company branding, job info, pagination
                </Text>
              </View>
              <CheckCircle color={Colors.success} size={18} />
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Print-Ready Format</Text>
            <Text style={styles.infoText}>
              • A4 size with proper margins{'\n'}
              • High contrast QR codes for scanning{'\n'}
              • Professional typography and layout{'\n'}
              • Automatic pagination for large inventories{'\n'}
              • Detail pages for items with photos/notes
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePrint}
              disabled={isPrinting}
              activeOpacity={0.8}
            >
              {isPrinting ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <>
                  <Printer color={Colors.background} size={20} />
                  <Text style={styles.primaryButtonText}>Print Report</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleShare}
              disabled={isSharing}
              activeOpacity={0.8}
            >
              {isSharing ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Share2 color={Colors.primary} size={20} />
                  <Text style={styles.secondaryButtonText}>Share PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              {report.company.name} · Confidential
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: Colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  previewContent: {
    padding: 16,
  },
  previewSection: {
    flex: 1,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 20,
  },
  previewLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  previewValueMono: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  previewDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  contentsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contentsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  contentDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.background,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  footerInfo: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
