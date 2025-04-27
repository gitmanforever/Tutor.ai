import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Youtube, Link, BrainCircuit, Flame, Clock, Camera, CirclePlus as PlusCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import { Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera as ExpoCamera } from 'expo-camera';

// GPT-4 Vision API configuration
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key
const OPENAI_VISION_API_URL = 'https://api.openai.com/v1/chat/completions';

// Type definitions
type WhiteboardAnalysis = {
  analysis: string;
  keyPoints: string[];
};

export default function HomeScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'youtube' | 'link' | 'whiteboard' | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [showWhiteboardPreview, setShowWhiteboardPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState([
    {
      id: '1',
      title: 'Biology 101: Cell Structure',
      date: 'Today, 10:30 AM',
      duration: '45 min',
      tags: ['Science', 'Important'],
      emoji: '🧬',
    },
    {
      id: '2',
      title: 'History: World War II',
      date: 'Yesterday, 2:15 PM',
      duration: '50 min',
      tags: ['History'],
      emoji: '📚',
    },
  ]);
  const [whiteboardAnalysis, setWhiteboardAnalysis] = useState<WhiteboardAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [whiteboardKeyPoints, setWhiteboardKeyPoints] = useState<string[]>([]);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [whiteboardImage, setWhiteboardImage] = useState<string | null>(null);
  const [showWhiteboardModal, setShowWhiteboardModal] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  const handleUpload = () => {
    setShowUploadModal(false);
    setInputUrl('');
    setUploadType(null);
    setCapturedImage(null);
    setShowWhiteboardPreview(false);
  };

  const handleWhiteboardCapture = async () => {
    if (!cameraPermission) {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera access is needed to capture whiteboard images');
        return;
      }
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled) {
        setWhiteboardImage(result.assets[0].uri);
        setShowWhiteboardModal(true);
      }
    } catch (error) {
      Alert.alert('Error capturing image', 'Please try again');
      console.error('Camera error:', error);
    }
  };

  const analyzeWhiteboardImage = async () => {
    if (!whiteboardImage) return;
    
    setIsAnalyzing(true);
    
    try {
      // Read the image as base64
      const base64 = await FileSystem.readAsStringAsync(whiteboardImage, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Configure the API request
      // In production, you would call your backend API that interfaces with the GPT-4 Vision API
      
      // For demo purposes, we'll simulate a successful analysis response
      // Normally you would make an actual API call here
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulated analysis response
      const simulatedAnalysis: WhiteboardAnalysis = {
        analysis: "The whiteboard displays a detailed illustration of the water cycle, which is a crucial ecological process. The diagram captures how water circulates through the Earth's atmosphere, surface, and underground systems. The arrows clearly indicate the flow direction between different states (liquid, gas, solid) and locations (atmosphere, surface, underground).\n\nThe diagram effectively demonstrates key processes including evaporation from bodies of water, transpiration from plants, condensation forming clouds, precipitation as rain or snow, infiltration into the soil, and runoff into bodies of water. The cyclical nature of the process is well-represented with a continuous flow of arrows connecting each stage.",
        keyPoints: [
          "The sun provides energy that drives evaporation from oceans, lakes, and rivers",
          "Water vapor rises and condenses in the atmosphere to form clouds",
          "Precipitation occurs when water falls as rain or snow",
          "Some water infiltrates the soil and becomes groundwater",
          "Plants absorb water and release it through transpiration",
          "Surface runoff returns water to larger bodies of water"
        ]
      };
      
      setWhiteboardAnalysis(simulatedAnalysis);
    } catch (error) {
      Alert.alert('Analysis failed', 'Unable to analyze the whiteboard image');
      console.error('Whiteboard analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveWhiteboardAnalysis = () => {
    if (!whiteboardAnalysis) return;
    
    // Create a new note with the whiteboard analysis
    const newNote = {
      title: "Whiteboard Analysis",
      content: whiteboardAnalysis.analysis,
      keyPoints: whiteboardAnalysis.keyPoints,
      imageUri: whiteboardImage,
      timestamp: new Date().toISOString()
    };
    
    // Navigate to the notes screen with the new note data
    router.push({
      pathname: "/notes",
      params: { newNote: JSON.stringify(newNote) }
    });
    
    // Close the modal
    setShowWhiteboardModal(false);
    setWhiteboardImage(null);
    setWhiteboardAnalysis(null);
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <Stack.Screen 
        options={{
          title: "Home",
          headerShown: false
        }}
      />

      <View style={[styles.header, darkMode && styles.headerDark]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🧠</Text>
          <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Tutor.ai</Text>
        </View>
        <TouchableOpacity 
          style={styles.newButton}
          onPress={() => setShowUploadModal(true)}
        >
          <PlusCircle size={20} color={darkMode ? "#FFF" : "#000"} />
          <Text style={[styles.newButtonText, darkMode && styles.newButtonTextDark]}>New</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, darkMode && styles.welcomeTitleDark]}>Welcome back!</Text>
            <Text style={[styles.welcomeSubtitle, darkMode && styles.welcomeSubtitleDark]}>
              Ready to capture your learning?
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.quickActions}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Quick Actions</Text>
          
          <View style={styles.actionCards}>
            <TouchableOpacity 
              style={[styles.actionCard, darkMode && styles.actionCardDark]}
              onPress={() => router.push('/transcribe')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#F0F8EB' }]}>
                <Mic size={24} color="#000" />
              </View>
              <Text style={[styles.actionTitle, darkMode && styles.actionTitleDark]}>Record Session</Text>
              <Text style={[styles.actionDescription, darkMode && styles.actionDescriptionDark]}>
                Transcribe lectures with AI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, darkMode && styles.actionCardDark]}
              onPress={() => setUploadType('youtube')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Youtube size={24} color="#000" />
              </View>
              <Text style={[styles.actionTitle, darkMode && styles.actionTitleDark]}>Upload Video</Text>
              <Text style={[styles.actionDescription, darkMode && styles.actionDescriptionDark]}>
                Analyze YouTube content
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.whiteboardCard, darkMode && styles.whiteboardCardDark]}
            onPress={() => setUploadType('whiteboard')}
          >
            <View style={styles.whiteboardContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Camera size={24} color="#000" />
              </View>
              <View style={styles.whiteboardText}>
                <Text style={[styles.whiteboardTitle, darkMode && styles.whiteboardTitleDark]}>Capture Whiteboard</Text>
                <Text style={[styles.whiteboardDescription, darkMode && styles.whiteboardDescriptionDark]}>
                  Snap a picture of notes or diagrams for instant summarization
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>This Week</Text>
          <View style={styles.statsCards}>
            <View style={[styles.statCard, { backgroundColor: darkMode ? '#223311' : '#F0F8EB' }]}>
              <BrainCircuit size={20} color={darkMode ? "#9CEE69" : "#000"} />
              <Text style={[styles.statValue, darkMode && styles.statValueDark]}>4</Text>
              <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Sessions</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: darkMode ? '#0A2C4A' : '#E3F2FD' }]}>
              <Clock size={20} color={darkMode ? "#88CCFF" : "#000"} />
              <Text style={[styles.statValue, darkMode && styles.statValueDark]}>3.5h</Text>
              <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Study Time</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: darkMode ? '#3A2004' : '#FFF3E0' }]}>
              <Flame size={20} color={darkMode ? "#FFAA44" : "#000"} />
              <Text style={[styles.statValue, darkMode && styles.statValueDark]}>85%</Text>
              <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Comprehension</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.recentSessionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Recent Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/notes')}>
              <Text style={[styles.viewAllText, darkMode && styles.viewAllTextDark]}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentSessions.map((session, index) => (
            <TouchableOpacity 
              key={session.id}
              style={[styles.sessionCard, darkMode && styles.sessionCardDark]}
              onPress={() => router.push('/notes')}
            >
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionEmoji}>{session.emoji}</Text>
                <Text style={[styles.sessionTitle, darkMode && styles.sessionTitleDark]}>{session.title}</Text>
                </View>
              <Text style={[styles.sessionDate, darkMode && styles.sessionDateDark]}>{session.date} • {session.duration}</Text>
                <View style={styles.sessionTags}>
                {session.tags.map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.tagPill}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showUploadModal || uploadType === 'whiteboard'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowUploadModal(false);
          setUploadType(null);
          setShowWhiteboardPreview(false);
          setCapturedImage(null);
        }}
      >
        <View style={[styles.modalOverlay, darkMode && styles.modalOverlayDark]}>
          <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
            {uploadType === 'whiteboard' ? (
              <>
                <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>Capture Whiteboard</Text>
                {showWhiteboardPreview ? (
                  <View style={styles.whiteboardPreview}>
                    <Image 
                      source={{ uri: capturedImage || 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg' }}
                      style={styles.whiteboardImage}
                    />
                    <View style={styles.previewActions}>
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelButton, darkMode && styles.cancelButtonDark]}
                        onPress={() => setShowWhiteboardPreview(false)}
                      >
                        <Text style={[styles.cancelButtonText, darkMode && styles.cancelButtonTextDark]}>Retake</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.uploadButton, darkMode && styles.uploadButtonDark]}
                        onPress={analyzeWhiteboardImage}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <ActivityIndicator size="small" color={darkMode ? "#FFF" : "#000"} />
                        ) : (
                          <>
                            <Text style={[styles.uploadButtonText, darkMode && styles.uploadButtonTextDark]}>
                              Analyze with AI
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                    {isAnalyzing && (
                      <View style={styles.analyzingContainer}>
                        <Text style={[styles.analyzingText, darkMode && styles.analyzingTextDark]}>
                          AI is analyzing your whiteboard...
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.captureContainer}>
                    <TouchableOpacity 
                      style={styles.captureButton}
                      onPress={handleWhiteboardCapture}
                    >
                      <Camera size={32} color="#000" />
                      <Text style={styles.captureButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <Text style={[styles.captureHint, darkMode && styles.captureHintDark]}>
                      Position the camera to capture the entire whiteboard
                    </Text>
                  </View>
                )}
              </>
            ) : !uploadType ? (
              <>
                <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>Upload Content</Text>
                <View style={styles.uploadOptions}>
                  <TouchableOpacity 
                    style={[styles.uploadOption, darkMode && styles.uploadOptionDark]}
                    onPress={() => setUploadType('youtube')}
                  >
                    <Youtube size={24} color={darkMode ? "#FFF" : "#000"} />
                    <Text style={[styles.uploadOptionText, darkMode && styles.uploadOptionTextDark]}>YouTube Video</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.uploadOption, darkMode && styles.uploadOptionDark]}
                    onPress={() => setUploadType('link')}
                  >
                    <Link size={24} color={darkMode ? "#FFF" : "#000"} />
                    <Text style={[styles.uploadOptionText, darkMode && styles.uploadOptionTextDark]}>Web Link</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.urlInputContainer}>
                <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>
                  Enter {uploadType === 'youtube' ? 'YouTube URL' : 'Web Link'}
                </Text>
                <TextInput
                  style={[styles.urlInput, darkMode && styles.urlInputDark]} 
                  placeholder={`Paste ${uploadType === 'youtube' ? 'YouTube URL' : 'Web Link'} here...`}
                  placeholderTextColor={darkMode ? "#777" : "#999"}
                  value={inputUrl}
                  onChangeText={setInputUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton, darkMode && styles.cancelButtonDark]}
                    onPress={() => setUploadType(null)}
                  >
                    <Text style={[styles.cancelButtonText, darkMode && styles.cancelButtonTextDark]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.uploadButton, darkMode && styles.uploadButtonDark]}
                    onPress={handleUpload}
                  >
                    <Text style={[styles.uploadButtonText, darkMode && styles.uploadButtonTextDark]}>Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Whiteboard Modal */}
      <Modal
        visible={showWhiteboardModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowWhiteboardModal(false);
          setWhiteboardImage(null);
          setWhiteboardAnalysis(null);
        }}
      >
        <SafeAreaView style={[styles.modalContainer, darkMode && styles.modalContainerDark]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowWhiteboardModal(false);
                setWhiteboardImage(null);
                setWhiteboardAnalysis(null);
              }}
            >
              <Ionicons 
                name="close" 
                size={32} 
                color={darkMode ? "white" : "black"} 
                style={styles.closeIcon} 
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>
              {whiteboardAnalysis ? "Whiteboard Analysis" : "Captured Whiteboard"}
            </Text>
            <View style={{width: 32}} />
          </View>
          
          <View style={styles.imageContainer}>
            {whiteboardImage && (
              <Image 
                source={{ uri: whiteboardImage }} 
                style={styles.whiteboardImage} 
                resizeMode="contain"
              />
            )}
          </View>
          
          {whiteboardAnalysis ? (
            <View style={styles.analysisContainer}>
              <View style={[styles.keyPointsContainer, darkMode && styles.keyPointsContainerDark]}>
                <Text style={[styles.keyPointsTitle, darkMode && styles.keyPointsTitleDark]}>
                  Key Points
                </Text>
                {whiteboardAnalysis.keyPoints.map((point, index) => (
                  <View key={index} style={styles.keyPointItem}>
                    <Text style={[styles.bulletPoint, darkMode && styles.bulletPointDark]}>•</Text>
                    <Text style={[styles.keyPointText, darkMode && styles.keyPointTextDark]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={[styles.analyzeButton, styles.saveButton]} 
                onPress={saveWhiteboardAnalysis}
              >
                <MaterialCommunityIcons name="content-save" size={24} color="white" />
                <Text style={styles.buttonText}>Save to Notes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.analyzeButton, styles.retakeButton]} 
                onPress={handleWhiteboardCapture}
              >
                <MaterialCommunityIcons name="camera-retake" size={24} color="white" />
                <Text style={styles.buttonText}>Retake Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.analyzeButton, styles.aiButton]} 
                onPress={analyzeWhiteboardImage}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <ActivityIndicator color="white" style={{marginRight: 8}} />
                    <Text style={styles.buttonText}>Analyzing...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="brain" size={24} color="white" />
                    <Text style={styles.buttonText}>Analyze with AI</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
  },
  headerDark: {
    backgroundColor: '#222',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 24,
    color: '#000',
  },
  headerTitleDark: {
    color: '#FFF',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: '#000',
  },
  newButtonTextDark: {
    color: '#FFF',
  },
  welcomeSection: {
    padding: 20,
  },
  welcomeTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 24,
    color: '#000',
    marginBottom: 8,
  },
  welcomeTitleDark: {
    color: '#FFF',
  },
  welcomeSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
  },
  welcomeSubtitleDark: {
    color: '#AAA',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#FFF',
  },
  actionCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionCardDark: {
    backgroundColor: '#222',
    borderColor: '#333',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginBottom: 12,
  },
  actionTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  actionTitleDark: {
    color: '#FFF',
  },
  actionDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  actionDescriptionDark: {
    color: '#AAA',
  },
  whiteboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  whiteboardCardDark: {
    backgroundColor: '#222',
    borderColor: '#333',
  },
  whiteboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whiteboardText: {
    flex: 1,
    marginLeft: 12,
  },
  whiteboardTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  whiteboardTitleDark: {
    color: '#FFF',
  },
  whiteboardDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  whiteboardDescriptionDark: {
    color: '#AAA',
  },
  statsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 20,
    color: '#000',
    marginTop: 6,
    marginBottom: 2,
  },
  statValueDark: {
    color: '#FFF',
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#666',
  },
  statLabelDark: {
    color: '#AAA',
  },
  recentSessionsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#000',
  },
  viewAllTextDark: {
    color: '#FFF',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sessionCardDark: {
    backgroundColor: '#222',
    borderColor: '#333',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  sessionTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  sessionTitleDark: {
    color: '#FFF',
  },
  sessionDate: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  sessionDateDark: {
    color: '#AAA',
  },
  sessionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#F0F8EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagPillDark: {
    backgroundColor: '#333',
  },
  tagText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: '#445511',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalContentDark: {
    backgroundColor: '#222',
  },
  modalTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 20,
    textAlign: 'center',
    color: '#000',
    marginBottom: 24,
  },
  modalTitleDark: {
    color: '#FFF',
  },
  uploadOptions: {
    gap: 16,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  uploadOptionDark: {
    backgroundColor: '#333',
  },
  uploadOptionText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#000',
  },
  uploadOptionTextDark: {
    color: '#FFF',
  },
  urlInputContainer: {
    gap: 16,
  },
  urlInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
  },
  urlInputDark: {
    backgroundColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonDark: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#555',
  },
  cancelButtonTextDark: {
    color: '#AAA',
  },
  uploadButton: {
    backgroundColor: '#9CEE69',
  },
  uploadButtonDark: {
    backgroundColor: '#333',
  },
  uploadButtonText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#000',
  },
  uploadButtonTextDark: {
    color: '#FFF',
  },
  captureContainer: {
    alignItems: 'center',
    gap: 24,
  },
  captureButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#9CEE69',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  captureButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: '#000',
  },
  captureHint: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  captureHintDark: {
    color: '#AAA',
  },
  whiteboardPreview: {
    gap: 16,
  },
  whiteboardImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  analyzingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  analyzingText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  analyzingTextDark: {
    color: '#AAA',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  modalContainerDark: {
    backgroundColor: '#121212',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeIcon: {
    padding: 4,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 20,
  },
  analysisContainer: {
    marginBottom: 20,
  },
  keyPointsContainer: {
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  keyPointsContainerDark: {
    backgroundColor: '#252530',
  },
  keyPointsTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#333',
    marginBottom: 12,
  },
  keyPointsTitleDark: {
    color: '#FFF',
  },
  keyPointItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#3478F6',
    marginRight: 8,
    lineHeight: 22,
  },
  bulletPointDark: {
    color: '#5E9CFF',
  },
  keyPointText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  keyPointTextDark: {
    color: '#DDD',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 20,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  retakeButton: {
    backgroundColor: '#FF9500',
  },
  aiButton: {
    backgroundColor: '#5E5CE6',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    marginLeft: 12,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});