import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { X, FileText, MapPin, Hash, Package } from 'lucide-react-native';
import { InventoryItem } from '@/types';
import QRCodeView from './QRCodeView';
import Colors from '@/constants/colors';

interface ItemDetailCardProps {
  item: InventoryItem;
  onClose?: () => void;
}

export default function ItemDetailCard({ item, onClose }: ItemDetailCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.itemBadge}>
            <Text style={styles.itemBadgeText}>{item.itemNumber}</Text>
          </View>
          <Text style={styles.headerTitle}>Item Detail</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={Colors.textMuted} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {item.media?.photoUrl && (
          <Image source={{ uri: item.media.photoUrl }} style={styles.image} />
        )}

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Hash color={Colors.primary} size={14} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Quantity</Text>
              <Text style={styles.infoValue}>{item.quantity}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Package color={Colors.primary} size={14} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Pieces</Text>
              <Text style={styles.infoValue}>{item.pieces}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <MapPin color={Colors.primary} size={14} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Room</Text>
              <Text style={styles.infoValue}>{item.room || '—'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <FileText color={Colors.primary} size={14} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Sidemark</Text>
              <Text style={styles.infoValue}>{item.sidemark || '—'}</Text>
            </View>
          </View>
        </View>

        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Handling Notes</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        {item.handlingVideo && (
          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <QRCodeView
                value={item.handlingVideo.qrValue}
                size={100}
                color={Colors.text}
                backgroundColor="#FFFFFF"
                showCopyButton
                copyLabel="Copy Link"
              />
            </View>
            <Text style={styles.qrLabel}>Scan for handling video</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemBadge: {
    backgroundColor: Colors.text,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.background,
    fontFamily: 'monospace',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  description: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 10,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  notesSection: {
    backgroundColor: Colors.surfaceLight,
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notesLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontWeight: '600' as const,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  qrSection: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },
  qrLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
