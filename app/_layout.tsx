import { useRef } from 'react';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View, StatusBar as RNStatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { 
  Outfit_400Regular, 
  Outfit_500Medium, 
  Outfit_600SemiBold,
  Outfit_700Bold
} from '@expo-google-fonts/outfit';
import { 
  PlusJakartaSans_400Regular, 
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Wrap the app with the ThemeProvider
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  useFrameworkReady();
  const { darkMode } = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? '#000' : '#FFF' }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style={darkMode ? "light" : "dark"} />
    </View>
  );
}