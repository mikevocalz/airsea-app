import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';

const USER_KEY = 'user_profile_storage';

const defaultUser: UserProfile = {
  id: 'USR-001',
  name: 'John Doe',
  email: 'john.doe@company.com',
  employeeId: 'EMP-2024-0001',
  department: 'Product Management',
  phone: '+1 (555) 123-4567',
  avatar: null,
};

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : defaultUser;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedUser: UserProfile) => {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    }
  }, [userQuery.data]);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    saveMutation.mutate(updated);
  }, [user, saveMutation]);

  return {
    user,
    updateUser,
    isLoading: userQuery.isLoading,
  };
});
