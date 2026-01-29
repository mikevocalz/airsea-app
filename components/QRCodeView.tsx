import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Check } from 'lucide-react-native';
import { generateQRMatrix } from '@/utils/qrcode';
import Colors from '@/constants/colors';

interface QRCodeViewProps {
  value: string;
  size: number;
  color?: string;
  backgroundColor?: string;
  showCopyButton?: boolean;
  copyLabel?: string;
}

export default function QRCodeView({ 
  value, 
  size, 
  color = '#000000', 
  backgroundColor = '#FFFFFF',
  showCopyButton = false,
  copyLabel = 'Copy Link',
}: QRCodeViewProps) {
  const [copied, setCopied] = useState(false);
  const matrix = useMemo(() => generateQRMatrix(value), [value]);
  
  const moduleSize = size / matrix.length;

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(value);
      setCopied(true);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Copied!', 'QR code link copied to clipboard');
      }
      
      setTimeout(() => setCopied(false), 2000);
      console.log('QR code link copied:', value);
    } catch (error) {
      console.error('Failed to copy:', error);
      Alert.alert('Error', 'Failed to copy link to clipboard');
    }
  };
  
  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
        {matrix.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.module,
                  {
                    width: moduleSize,
                    height: moduleSize,
                    backgroundColor: cell === 1 ? color : 'transparent',
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      {showCopyButton && (
        <TouchableOpacity
          style={[styles.copyButton, copied && styles.copyButtonSuccess]}
          onPress={handleCopyLink}
          activeOpacity={0.7}
        >
          {copied ? (
            <Check color={Colors.success} size={14} />
          ) : (
            <Copy color={Colors.primary} size={14} />
          )}
          <Text style={[styles.copyButtonText, copied && styles.copyButtonTextSuccess]}>
            {copied ? 'Copied!' : copyLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  module: {},
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  copyButtonSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.success,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  copyButtonTextSuccess: {
    color: Colors.success,
  },
});
