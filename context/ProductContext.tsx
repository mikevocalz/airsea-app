import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

const PRODUCTS_KEY = 'products_storage';

export const [ProductProvider, useProducts] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedProducts: Product[]) => {
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
      return updatedProducts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  useEffect(() => {
    if (productsQuery.data) {
      setProducts(productsQuery.data);
    }
  }, [productsQuery.data]);

  const addProduct = useCallback((product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    saveMutation.mutate(updated);
  }, [products, saveMutation]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setProducts(updated);
    saveMutation.mutate(updated);
  }, [products, saveMutation]);

  const deleteProduct = useCallback((id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveMutation.mutate(updated);
  }, [products, saveMutation]);

  const getProduct = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    isLoading: productsQuery.isLoading,
  };
});
