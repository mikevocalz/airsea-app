import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { generateQRMatrix } from '@/utils/qrcode';

interface QRCodeViewProps {
  value: string;
  size: number;
  color?: string;
  backgroundColor?: string;
}

export default function QRCodeView({ 
  value, 
  size, 
  color = '#000000', 
  backgroundColor = '#FFFFFF' 
}: QRCodeViewProps) {
  const matrix = useMemo(() => generateQRMatrix(value), [value]);
  
  const moduleSize = size / matrix.length;
  
  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  module: {},
});
