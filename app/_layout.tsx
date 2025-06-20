import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null; // Or a custom loading component
  }

  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="index" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}