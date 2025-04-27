import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ArrowRight, BookOpen, Eye, Ear, HandMetal } from 'lucide-react-native';

const learningStyles = [
  {
    id: 'visual',
    name: 'Visual',
    icon: Eye,
    description: 'You learn best through seeing information presented visually.',
    examples: 'Charts, diagrams, mind maps, videos',
  },
  {
    id: 'auditory',
    name: 'Auditory',
    icon: Ear,
    description: 'You learn best by hearing and listening to information.',
    examples: 'Lectures, discussions, audio recordings, verbal repetition',
  },
  {
    id: 'kinesthetic',
    name: 'Kinesthetic',
    icon: HandMetal,
    description: 'You learn best through physical activities and hands-on experiences.',
    examples: 'Practice exercises, role-playing, interactive simulations',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  
  const handleContinue = () => {
    if (selectedStyle) {
      // In a real app, you would save this preference
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F5FFF0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn.delay(300).duration(800)} style={styles.header}>
          <Text style={styles.title}>Welcome to Tutor.ai</Text>
          <Text style={styles.subtitle}>
            Let's personalize your learning experience
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.content}>
          <Text style={styles.sectionTitle}>
            Select Your Primary Learning Style
          </Text>
          <Text style={styles.sectionDescription}>
            This helps us adapt content to your preferred way of learning
          </Text>

          <View style={styles.learningStylesContainer}>
            {learningStyles.map((style, index) => {
              const Icon = style.icon;
              const isSelected = selectedStyle === style.id;
              
              return (
                <Animated.View
                  key={style.id}
                  entering={FadeInDown.delay(800 + index * 200).duration(800)}
                >
                  <TouchableOpacity
                    style={[
                      styles.styleCard,
                      isSelected && styles.styleCardSelected,
                    ]}
                    onPress={() => setSelectedStyle(style.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                      <Icon size={28} color={isSelected ? '#000' : '#666'} />
                    </View>
                    <Text style={[styles.styleName, isSelected && styles.styleNameSelected]}>
                      {style.name}
                    </Text>
                    <Text style={styles.styleDescription}>{style.description}</Text>
                    <Text style={styles.styleExamples}>
                      <Text style={styles.examplesLabel}>Examples: </Text>
                      {style.examples}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1400).duration(800)} style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !selectedStyle && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedStyle}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 20,
    color: '#000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  learningStylesContainer: {
    gap: 16,
  },
  styleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    marginBottom: 12,
  },
  styleCardSelected: {
    borderColor: '#9CEE69',
    backgroundColor: '#F7FFF2',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#9CEE69',
  },
  styleName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  styleNameSelected: {
    color: '#000',
  },
  styleDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  styleExamples: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  examplesLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#9CEE69',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.8,
  },
  continueButtonText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: '#000',
  },
  skipText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
});