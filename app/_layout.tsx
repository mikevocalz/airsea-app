import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProductProvider } from "@/context/ProductContext";
import { UserProvider } from "@/context/UserContext";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[id]"
        options={{
          title: "Product Details",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="product/add"
        options={{
          title: "Add Product",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="product/pdf/[id]"
        options={{
          title: "Product PDF",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ProductProvider>
          <UserProvider>
            <RootLayoutNav />
          </UserProvider>
        </ProductProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
