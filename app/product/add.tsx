import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  ImagePlus,
  Video,
  X,
  Plus,
  Check,
  Package,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types';

export default function AddProductScreen() {
  const router = useRouter();
  const { addProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    mainImage: '',
    productImages: [] as string[],
    videos: [] as string[],
  });

  const generateId = () => {
    return 'PRD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  const generateQRCode = (productId: string) => {
    const data = encodeURIComponent(`https://company.com/product/${productId}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${data}&bgcolor=FFFFFF&color=000000`;
  };

  const pickMainImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setForm({ ...form, mainImage: result.assets[0].uri });
    }
  };

  const takeMainPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setForm({ ...form, mainImage: result.assets[0].uri });
    }
  };

  const pickProductImage = async () => {
    if (form.productImages.length >= 4) {
      Alert.alert('Limit Reached', 'You can only add up to 4 product images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setForm({ ...form, productImages: [...form.productImages, result.assets[0].uri] });
    }
  };

  const removeProductImage = (index: number) => {
    const updated = [...form.productImages];
    updated.splice(index, 1);
    setForm({ ...form, productImages: updated });
  };

  const pickVideo = async () => {
    if (form.videos.length >= 4) {
      Alert.alert('Limit Reached', 'You can only add up to 4 videos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setForm({ ...form, videos: [...form.videos, result.assets[0].uri] });
    }
  };

  const recordVideo = async () => {
    if (form.videos.length >= 4) {
      Alert.alert('Limit Reached', 'You can only add up to 4 videos');
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to record videos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 30,
    });

    if (!result.canceled && result.assets[0]) {
      setForm({ ...form, videos: [...form.videos, result.assets[0].uri] });
    }
  };

  const removeVideo = (index: number) => {
    const updated = [...form.videos];
    updated.splice(index, 1);
    setForm({ ...form, videos: updated });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter a product name');
      return;
    }
    if (!form.sku.trim()) {
      Alert.alert('Required', 'Please enter a SKU');
      return;
    }
    if (!form.price.trim()) {
      Alert.alert('Required', 'Please enter a price');
      return;
    }

    setIsSubmitting(true);

    const productId = generateId();
    const newProduct: Product = {
      id: productId,
      name: form.name.trim(),
      description: form.description.trim(),
      sku: form.sku.trim(),
      price: form.price.trim(),
      mainImage: form.mainImage,
      productImages: form.productImages,
      videoClip: form.videos.length > 0 ? form.videos[0] : null,
      createdAt: new Date().toISOString(),
      qrCode: generateQRCode(productId),
    };

    setTimeout(() => {
      addProduct(newProduct);
      setIsSubmitting(false);
      Alert.alert('Success', 'Product added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Image</Text>
          <View style={styles.mainImageSection}>
            {form.mainImage ? (
              <View style={styles.mainImageContainer}>
                <Image source={{ uri: form.mainImage }} style={styles.mainImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setForm({ ...form, mainImage: '' })}
                >
                  <X color={Colors.text} size={16} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mainImagePlaceholder}>
                <Package color={Colors.textMuted} size={48} />
                <Text style={styles.placeholderText}>Add main image</Text>
              </View>
            )}
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageActionButton} onPress={takeMainPhoto}>
                <Camera color={Colors.primary} size={22} />
                <Text style={styles.imageActionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageActionButton} onPress={pickMainImage}>
                <ImagePlus color={Colors.primary} size={22} />
                <Text style={styles.imageActionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Enter product name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Enter product description"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>SKU *</Text>
              <TextInput
                style={styles.input}
                value={form.sku}
                onChangeText={(text) => setForm({ ...form, sku: text.toUpperCase() })}
                placeholder="e.g., SKU-001"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.input}
                value={form.price}
                onChangeText={(text) => setForm({ ...form, price: text.replace(/[^0-9.]/g, '') })}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images (up to 4)</Text>
          <View style={styles.imageGrid}>
            {form.productImages.map((uri, index) => (
              <View key={index} style={styles.gridImageContainer}>
                <Image source={{ uri }} style={styles.gridImage} />
                <TouchableOpacity
                  style={styles.removeGridImageButton}
                  onPress={() => removeProductImage(index)}
                >
                  <X color={Colors.text} size={14} />
                </TouchableOpacity>
              </View>
            ))}
            {form.productImages.length < 4 && (
              <TouchableOpacity style={styles.addGridImageButton} onPress={pickProductImage}>
                <Plus color={Colors.primary} size={28} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Videos (up to 4)</Text>
          <Text style={styles.sectionSubtitle}>
            Add 3-4 video clips to be merged into one product video
          </Text>
          <View style={styles.videoList}>
            {form.videos.map((uri, index) => (
              <View key={index} style={styles.videoItem}>
                <View style={styles.videoPreview}>
                  <Video color={Colors.primary} size={24} />
                </View>
                <Text style={styles.videoText}>Video {index + 1}</Text>
                <TouchableOpacity
                  style={styles.removeVideoButton}
                  onPress={() => removeVideo(index)}
                >
                  <X color={Colors.error} size={18} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {form.videos.length < 4 && (
            <View style={styles.videoActions}>
              <TouchableOpacity style={styles.videoActionButton} onPress={recordVideo}>
                <Camera color={Colors.text} size={20} />
                <Text style={styles.videoActionText}>Record</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.videoActionButton} onPress={pickVideo}>
                <Video color={Colors.text} size={20} />
                <Text style={styles.videoActionText}>Choose</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <>
              <Check color={Colors.background} size={22} />
              <Text style={styles.submitButtonText}>Create Product</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: -8,
  },
  mainImageSection: {
    alignItems: 'center',
  },
  mainImageContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
  imageActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeGridImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGridImageButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoList: {
    marginBottom: 12,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  videoPreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    marginLeft: 12,
  },
  removeVideoButton: {
    padding: 8,
  },
  videoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  videoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  videoActionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.background,
  },
});
