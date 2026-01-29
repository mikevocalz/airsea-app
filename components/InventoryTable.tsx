import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { InventoryItem } from '@/types';
import QRCodeView from './QRCodeView';
import Colors from '@/constants/colors';

interface InventoryTableProps {
  items: InventoryItem[];
  showQRCodes?: boolean;
}

export default function InventoryTable({ items, showQRCodes = true }: InventoryTableProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.itemCol]}>Item #</Text>
        <Text style={[styles.headerCell, styles.qtyCol]}>Qty</Text>
        <Text style={[styles.headerCell, styles.pcsCol]}>Pcs</Text>
        <Text style={[styles.headerCell, styles.descCol]}>Description</Text>
        <Text style={[styles.headerCell, styles.roomCol]}>Room</Text>
        {showQRCodes && (
          <Text style={[styles.headerCell, styles.qrCol]}>Handling</Text>
        )}
      </View>
      
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {items.map((item, index) => (
          <View
            key={item.itemNumber}
            style={[
              styles.dataRow,
              index % 2 === 1 && styles.zebraRow,
            ]}
          >
            <Text style={[styles.dataCell, styles.itemCol, styles.monoText]}>
              {item.itemNumber}
            </Text>
            <Text style={[styles.dataCell, styles.qtyCol, styles.centerText]}>
              {item.quantity}
            </Text>
            <Text style={[styles.dataCell, styles.pcsCol, styles.centerText]}>
              {item.pieces}
            </Text>
            <View style={[styles.descCol, styles.descContainer]}>
              <Text style={styles.descText} numberOfLines={2}>
                {item.description}
              </Text>
              {item.sidemark && (
                <Text style={styles.sidemarkText}>SM: {item.sidemark}</Text>
              )}
            </View>
            <Text style={[styles.dataCell, styles.roomCol]} numberOfLines={2}>
              {item.room || '-'}
            </Text>
            {showQRCodes && (
              <View style={[styles.qrCol, styles.qrContainer]}>
                {item.handlingVideo ? (
                  <QRCodeView
                    value={item.handlingVideo.qrValue}
                    size={48}
                    color={Colors.text}
                    backgroundColor={Colors.background}
                  />
                ) : (
                  <Text style={styles.noQrText}>-</Text>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.background,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    minHeight: 64,
  },
  zebraRow: {
    backgroundColor: Colors.surfaceLight,
  },
  dataCell: {
    fontSize: 13,
    color: Colors.text,
  },
  monoText: {
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  centerText: {
    textAlign: 'center',
  },
  itemCol: {
    width: 70,
  },
  qtyCol: {
    width: 40,
  },
  pcsCol: {
    width: 40,
  },
  descCol: {
    flex: 1,
    paddingRight: 8,
  },
  descContainer: {
    justifyContent: 'center',
  },
  descText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  sidemarkText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  roomCol: {
    width: 80,
  },
  qrCol: {
    width: 56,
    alignItems: 'center',
  },
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noQrText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
