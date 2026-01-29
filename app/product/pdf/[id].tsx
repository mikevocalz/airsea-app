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
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Printer, Share2, FileText, Package } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useProducts } from '@/context/ProductContext';
import { useUser } from '@/context/UserContext';

export default function ProductPDFScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProduct } = useProducts();
  const { user } = useUser();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const product = getProduct(id || '');

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Package color={Colors.textMuted} size={64} />
          <Text style={styles.notFoundText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generateHTML = () => {
    const productImagesHTML = product.productImages.length > 0
      ? `
        <div class="section">
          <h3>Product Images</h3>
          <div class="image-grid">
            ${product.productImages.map((uri, i) => `
              <img src="${uri}" alt="Product image ${i + 1}" class="product-img" />
            `).join('')}
          </div>
        </div>
      `
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Product Sheet - ${product.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #1a1a1a;
              line-height: 1.6;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #D4A574;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-info h1 {
              font-size: 28px;
              color: #D4A574;
              margin-bottom: 4px;
            }
            .company-info p {
              font-size: 12px;
              color: #666;
            }
            .doc-info {
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            .main-section {
              display: flex;
              gap: 30px;
              margin-bottom: 30px;
            }
            .main-image {
              width: 200px;
              height: 200px;
              object-fit: cover;
              border-radius: 12px;
              background: #f5f5f5;
            }
            .main-placeholder {
              width: 200px;
              height: 200px;
              background: #f5f5f5;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #999;
            }
            .details {
              flex: 1;
            }
            .product-name {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .sku {
              font-size: 14px;
              color: #D4A574;
              font-weight: 600;
              margin-bottom: 16px;
              font-family: monospace;
            }
            .price {
              font-size: 28px;
              font-weight: 700;
              color: #D4A574;
              margin-bottom: 16px;
            }
            .description {
              font-size: 14px;
              color: #444;
              line-height: 1.7;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h3 {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #666;
              margin-bottom: 12px;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
            }
            .image-grid {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
            }
            .product-img {
              width: 120px;
              height: 90px;
              object-fit: cover;
              border-radius: 8px;
            }
            .qr-section {
              display: flex;
              align-items: center;
              gap: 20px;
              background: #f9f9f9;
              padding: 20px;
              border-radius: 12px;
            }
            .qr-code {
              width: 120px;
              height: 120px;
            }
            .qr-info h4 {
              font-size: 14px;
              margin-bottom: 4px;
            }
            .qr-info p {
              font-size: 12px;
              color: #666;
              font-family: monospace;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
            .meta-item label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #999;
              display: block;
              margin-bottom: 4px;
            }
            .meta-item span {
              font-size: 14px;
              color: #333;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 11px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>Product Catalog</h1>
              <p>Professional Product Documentation</p>
            </div>
            <div class="doc-info">
              <p>Document ID: ${product.id}</p>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
              <p>By: ${user.name}</p>
            </div>
          </div>

          <div class="main-section">
            ${product.mainImage 
              ? `<img src="${product.mainImage}" class="main-image" alt="${product.name}" />`
              : `<div class="main-placeholder">No Image</div>`
            }
            <div class="details">
              <h2 class="product-name">${product.name}</h2>
              <div class="sku">SKU: ${product.sku}</div>
              <div class="price">$${product.price}</div>
              ${product.description 
                ? `<p class="description">${product.description}</p>`
                : ''
              }
            </div>
          </div>

          ${productImagesHTML}

          <div class="section">
            <h3>Product QR Code</h3>
            <div class="qr-section">
              <img src="${product.qrCode}" class="qr-code" alt="QR Code" />
              <div class="qr-info">
                <h4>Scan to view product</h4>
                <p>ID: ${product.id}</p>
                <p>Unique identifier for this product</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Product Information</h3>
            <div class="meta-grid">
              <div class="meta-item">
                <label>Created Date</label>
                <span>${formatDate(product.createdAt)}</span>
              </div>
              <div class="meta-item">
                <label>SKU Number</label>
                <span>${product.sku}</span>
              </div>
              <div class="meta-item">
                <label>Price</label>
                <span>$${product.price}</span>
              </div>
              <div class="meta-item">
                <label>Total Images</label>
                <span>${product.productImages.length + (product.mainImage ? 1 : 0)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This document was generated from the Product Catalog System</p>
            <p>© ${new Date().getFullYear()} All rights reserved</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const html = generateHTML();
      await Print.printAsync({ html });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print document');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({ html });
      
      if (Platform.OS === 'web') {
        Alert.alert('Info', 'Sharing is not available on web. Use print instead.');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Share ${product.name} PDF`,
          });
        } else {
          Alert.alert('Info', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share document');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Product PDF' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <FileText color={Colors.primary} size={24} />
              <Text style={styles.previewTitle}>Document Preview</Text>
            </View>

            <View style={styles.previewContent}>
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Product Name</Text>
                <Text style={styles.previewValue}>{product.name}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>SKU</Text>
                  <Text style={styles.previewValueMono}>{product.sku}</Text>
                </View>
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Price</Text>
                  <Text style={styles.previewValue}>${product.price}</Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Document ID</Text>
                <Text style={styles.previewValueMono}>{product.id}</Text>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Images</Text>
                  <Text style={styles.previewValue}>
                    {product.productImages.length + (product.mainImage ? 1 : 0)}
                  </Text>
                </View>
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>QR Code</Text>
                  <Text style={styles.previewValueSuccess}>Included</Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Created By</Text>
                <Text style={styles.previewValue}>{user.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>PDF Contents</Text>
            <Text style={styles.infoText}>
              • Product header with company branding{'\n'}
              • Main product image and details{'\n'}
              • Full product description{'\n'}
              • Additional product images gallery{'\n'}
              • Unique QR code with product ID{'\n'}
              • Complete product metadata
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <>
                  <Printer color={Colors.background} size={20} />
                  <Text style={styles.primaryButtonText}>Print PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleShare}
              disabled={isSharing}
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
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textMuted,
    marginTop: 16,
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
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.textMuted,
    marginBottom: 4,
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
  previewValueSuccess: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.success,
  },
  previewDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  infoCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
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
});
