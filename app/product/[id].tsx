import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  FileText,
  QrCode,
  Trash2,
  Calendar,
  Tag,
  DollarSign,
  Images,
  Video,
  Package,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useProducts } from '@/context/ProductContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getProduct, deleteProduct } = useProducts();

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

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProduct(product.id);
            router.back();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          {product.mainImage ? (
            <Image source={{ uri: product.mainImage }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Package color={Colors.textMuted} size={64} />
            </View>
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.priceTag}>
              <DollarSign color={Colors.background} size={16} />
              <Text style={styles.priceText}>{product.price}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.skuBadge}>
              <Tag color={Colors.primary} size={14} />
              <Text style={styles.skuText}>{product.sku}</Text>
            </View>
          </View>

          {product.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Calendar color={Colors.textMuted} size={16} />
              <Text style={styles.metaText}>Created {formatDate(product.createdAt)}</Text>
            </View>
          </View>

          {product.productImages.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Images color={Colors.primary} size={18} />
                <Text style={styles.sectionTitle}>Product Images</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageScrollContent}
              >
                {product.productImages.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.productImage} />
                ))}
              </ScrollView>
            </View>
          )}

          {product.videoClip && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Video color={Colors.accent} size={18} />
                <Text style={styles.sectionTitle}>Video Clip</Text>
              </View>
              <View style={styles.videoPlaceholder}>
                <Video color={Colors.textMuted} size={32} />
                <Text style={styles.videoPlaceholderText}>Video available</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <QrCode color={Colors.primary} size={18} />
              <Text style={styles.sectionTitle}>Product QR Code</Text>
            </View>
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <Image
                  source={{ uri: product.qrCode }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
                <View style={styles.qrLogo}>
                  <Package color={Colors.primary} size={20} />
                </View>
              </View>
              <Text style={styles.qrId}>ID: {product.id}</Text>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push(`/product/pdf/${product.id}`)}
            >
              <FileText color={Colors.background} size={20} />
              <Text style={styles.primaryButtonText}>View PDF & Print</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 color={Colors.error} size={20} />
              <Text style={styles.deleteButtonText}>Delete Product</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  heroSection: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  skuBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  skuText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  metaSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    paddingTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  imageScrollContent: {
    gap: 12,
  },
  productImage: {
    width: 140,
    height: 105,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  videoPlaceholder: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  videoPlaceholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrWrapper: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  qrCode: {
    width: 180,
    height: 180,
  },
  qrLogo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  qrId: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  actionsSection: {
    gap: 12,
    marginTop: 8,
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
  deleteButton: {
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
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
  },
});
