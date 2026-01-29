import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import {
  FileText,
  Printer,
  ChevronRight,
  Package,
  QrCode,
  LayoutList,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { sampleInventoryReport } from '@/mocks/inventoryData';
import InventoryTable from '@/components/InventoryTable';
import InventoryReportHeader from '@/components/InventoryReportHeader';
import ItemDetailCard from '@/components/ItemDetailCard';
import { InventoryItem } from '@/types';

const { width } = Dimensions.get('window');

export default function InventoryScreen() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const report = sampleInventoryReport;

  const handleItemPress = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const totalQuantity = report.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPieces = report.items.reduce((sum, item) => sum + item.pieces, 0);
  const itemsWithVideo = report.items.filter(item => item.handlingVideo).length;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Inventory Report',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <InventoryReportHeader report={report} />

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Package color={Colors.primary} size={18} />
              </View>
              <Text style={styles.statValue}>{report.items.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <LayoutList color={Colors.accent} size={18} />
              </View>
              <Text style={styles.statValue}>{totalPieces}</Text>
              <Text style={styles.statLabel}>Total Pieces</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <QrCode color={Colors.primaryLight} size={18} />
              </View>
              <Text style={styles.statValue}>{itemsWithVideo}</Text>
              <Text style={styles.statLabel}>With Video</Text>
            </View>
          </View>

          <View style={styles.tableSection}>
            <Text style={styles.sectionTitle}>Inventory Items</Text>
            <View style={styles.tableContainer}>
              <InventoryTable items={report.items} showQRCodes={true} />
            </View>
          </View>

          <View style={styles.itemsList}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            {report.items.map((item) => (
              <TouchableOpacity
                key={item.itemNumber}
                style={styles.itemCard}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.itemBadge}>
                  <Text style={styles.itemBadgeText}>{item.itemNumber}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemMetaText}>
                      Qty: {item.quantity} · Pcs: {item.pieces}
                    </Text>
                    {item.room && (
                      <Text style={styles.itemRoom}>{item.room}</Text>
                    )}
                  </View>
                </View>
                {item.handlingVideo && (
                  <QrCode color={Colors.textMuted} size={16} />
                )}
                <ChevronRight color={Colors.textMuted} size={18} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/inventory/pdf')}
              activeOpacity={0.8}
            >
              <FileText color={Colors.background} size={20} />
              <Text style={styles.primaryButtonText}>Generate PDF Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/inventory/pdf')}
              activeOpacity={0.8}
            >
              <Printer color={Colors.primary} size={20} />
              <Text style={styles.secondaryButtonText}>Print Report</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {report.company.name} · Confidential
            </Text>
            <Text style={styles.footerText}>
              Report ID: {report.id}
            </Text>
          </View>
        </ScrollView>

        <Modal
          visible={selectedItem !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedItem && (
                <ItemDetailCard item={selectedItem} onClose={closeModal} />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tableSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tableContainer: {
    height: 320,
  },
  itemsList: {
    marginBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  itemBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  itemBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  itemInfo: {
    flex: 1,
  },
  itemDesc: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  itemRoom: {
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
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
  footer: {
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    maxHeight: '85%',
  },
});
