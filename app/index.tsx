import { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 800 }),
      withDelay(1500, withTiming(0, { duration: 500 }))
    );
    
    scale.value = withSequence(
      withTiming(1, { duration: 800 }),
      withDelay(1500, withTiming(1.1, { duration: 500 }))
    );

    // Navigate to onboarding after animation completes
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F5FFF0']}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>🧠</Text>
        </View>
        <Text style={styles.logoText}>Tutor.ai</Text>
        <Text style={styles.tagline}>By Shreyash Srivastva</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#9CEE69',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 48,
  },
  logoText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 32,
    color: '#000',
    marginBottom: 4,
  },
  tagline: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#333',
  }
});