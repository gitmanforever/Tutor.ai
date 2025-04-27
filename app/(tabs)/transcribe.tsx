import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Pause, Play, Square as Stop, BookmarkPlus, Save, Brain, FilePlus, Clock, Tag, Edit3 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'react-native';

// OpenAI API configuration
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';

type Segment = {
  id: number;
  speaker: string;
  content: string;
  timestamp: string;
  isKey?: boolean;
  isChapterTitle?: boolean;
  emoji?: string;
};

type Chapter = {
  id: string;
  title: string;
  emoji: string;
  content: string;
  timestamp: string;
};

type AISummary = {
  text: string;
  keyPoints: string[];
  chapters: Chapter[];
};

export default function TranscribeScreen() {
  const { darkMode } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcription, setTranscription] = useState<Segment[]>([]);
  const [highlightedSegments, setHighlightedSegments] = useState<number[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState('');
  const [showAISummaryModal, setShowAISummaryModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiKeyPoints, setAiKeyPoints] = useState<string[]>([]);
  const [aiIsProcessing, setAiIsProcessing] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingChunks, setRecordingChunks] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation value for controls container
  const controlsOffset = useSharedValue(0);
  
  const animatedControlsStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: controlsOffset.value }],
    };
  });
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isRecording && !isPaused) {
      controlsOffset.value = withSpring(0, { damping: 15 });
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);
  
  // Format time in MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Create a new recording chunk every 15 seconds for real-time transcription
  useEffect(() => {
    if (isRecording && !isPaused && elapsedTime > 0 && elapsedTime % 15 === 0) {
      createAndTranscribeRecordingChunk();
    }
  }, [elapsedTime, isRecording, isPaused]);
  
  const createAndTranscribeRecordingChunk = async () => {
    if (!recording) return;
    
    try {
      // Pause current recording
      await recording.pauseAsync();
      
      // Get the URI of the recording
      const uri = recording.getURI();
      if (!uri) {
        await recording.startAsync();
        return;
      }
      
      // Create a new file name for this chunk
      const chunkUri = FileSystem.documentDirectory + `recording_chunk_${Date.now()}.m4a`;
      
      // Copy the current recording to the new chunk file
      await FileSystem.copyAsync({
        from: uri,
        to: chunkUri
      });
      
      // Add to chunk list
      setRecordingChunks(prev => [...prev, chunkUri]);
      
      // Use startAsync instead of resumeAsync
      await recording.startAsync();
      
      // Start transcription for this chunk
      transcribeAudioChunk(chunkUri);
      
    } catch (error) {
      console.error('Error creating recording chunk:', error);
      if (recording.getStatusAsync) {
        const status = await recording.getStatusAsync();
        if (!status.isRecording) {
          await recording.startAsync();
        }
      }
    }
  };
  
  const transcribeAudioChunk = async (audioChunkUri: string) => {
    setIsTranscribing(true);
    
    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', {
        uri: audioChunkUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      
      // For testing/demo purposes, we'll simulate a response
      // In a real app, you would uncomment the fetch code below
      /*
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      const text = data.text;
      */
      
      // Simulated response for demo
      const text = getRandomTranscriptionText();
      
      // Add the transcribed text as a new segment
      const newSegment: Segment = {
        id: Date.now(),
        speaker: 'Speaker',
        content: text,
        timestamp: formatTime(elapsedTime),
      };
      
      setTranscription(prev => [...prev, newSegment]);
      
      // Auto-scroll to the latest transcription
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsTranscribing(false);
    }
  };
  
  // Simulate random transcription text (for demo purposes)
  const getRandomTranscriptionText = (): string => {
    const transcriptionOptions = [
      "The key characteristic of dyslexia is difficulty with phonological processing, which affects the ability to recognize and manipulate the sounds in words.",
      "Students with dyslexia often benefit from multisensory teaching methods that engage visual, auditory, and kinesthetic learning pathways simultaneously.",
      "Assistive technologies like text-to-speech software can significantly improve reading comprehension for dyslexic students.",
      "Dyslexia is not related to intelligence; many dyslexic individuals have average or above-average cognitive abilities.",
      "Early intervention is crucial for students with dyslexia to develop effective reading strategies and build confidence.",
      "Structured literacy approaches that explicitly teach phonics, decoding, and spelling rules are particularly effective for dyslexic learners.",
      "Many famous innovators and creative thinkers throughout history have had dyslexia, including Einstein, Leonardo da Vinci, and Steve Jobs.",
      "Dyslexia often co-occurs with other learning differences like ADHD, dysgraphia, or dyscalculia, requiring comprehensive support strategies.",
      "The brain of someone with dyslexia processes information differently, particularly in the regions responsible for language processing.",
      "Accommodations such as extended time on tests and alternative assessment methods can help dyslexic students demonstrate their true knowledge."
    ];
    
    return transcriptionOptions[Math.floor(Math.random() * transcriptionOptions.length)];
  };
  
  const startRecording = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access microphone is required!');
          return;
        }
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
      setTranscription([]);
      setElapsedTime(0);
      setRecordingChunks([]);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };
  
  const pauseRecording = async () => {
    if (!recording) return;
    
    try {
      if (isPaused) {
        await recording.startAsync();
        setIsPaused(false);
      } else {
        await recording.pauseAsync();
        setIsPaused(true);
      }
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (err) {
      console.error('Failed to pause recording', err);
    }
  };
  
  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      if (uri) {
        // Save the final audio file
        const finalAudioPath = FileSystem.documentDirectory + `recording_${Date.now()}.m4a`;
        await FileSystem.copyAsync({
          from: uri,
          to: finalAudioPath
        });
        
        setAudioUri(finalAudioPath);
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      // Use a longer delay to ensure all state updates are complete
      setTimeout(() => {
        setShowSaveModal(true);
      }, 500);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };
  
  const highlightSegment = (id: number) => {
    if (highlightedSegments.includes(id)) {
      setHighlightedSegments(prev => prev.filter(segId => segId !== id));
    } else {
      setHighlightedSegments(prev => [...prev, id]);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };
  
  const generateAISummary = async () => {
    // Show the modal and set loading state
    setAiIsProcessing(true);
    setShowAISummaryModal(true);
    
    // Direct simple demo content
    const demoSummary = "This lecture focused on dyslexia, a learning disorder that affects reading ability due to difficulties identifying speech sounds and learning how they relate to letters. Key characteristics include difficulty with phonological processing, which affects the ability to recognize and manipulate sounds in words. The lecture emphasized that dyslexia is not related to intelligence, with many dyslexic individuals having average or above-average cognitive abilities.";
    
    const demoKeyPoints = [
      "🧠 Dyslexia affects phonological processing but not intelligence",
      "👐 Multisensory teaching methods are particularly effective for learning",
      "🔊 Assistive technologies like text-to-speech improve reading comprehension",
      "⏱️ Early intervention is crucial for developing effective reading strategies",
      "📚 Structured literacy with explicit phonics instruction works best",
      "💡 Many successful innovators throughout history had dyslexia"
    ];
    
    // Create chapters
    const demoChapters = [
      {
        id: '1',
        title: 'Understanding Dyslexia',
        emoji: '🧠',
        timestamp: formatTime(Math.floor(elapsedTime * 0.2))
      },
      {
        id: '2',
        title: 'Characteristics & Symptoms',
        emoji: '📊',
        timestamp: formatTime(Math.floor(elapsedTime * 0.4))
      },
      {
        id: '3',
        title: 'Teaching Strategies',
        emoji: '📚',
        timestamp: formatTime(Math.floor(elapsedTime * 0.6))
      },
      {
        id: '4',
        title: 'Assistive Technologies',
        emoji: '💻',
        timestamp: formatTime(Math.floor(elapsedTime * 0.8))
      }
    ];
    
    // Set states immediately for testing
    setAiSummary(demoSummary);
    setAiKeyPoints(demoKeyPoints);
    
    // Add chapter markers to the transcription
    const chapterSegments = demoChapters.map(chapter => ({
      id: Date.now() + parseInt(chapter.id),
      speaker: 'Chapter',
      content: chapter.title,
      timestamp: chapter.timestamp,
      isChapterTitle: true,
      emoji: chapter.emoji
    }));
    
    setTranscription(prev => [...prev.filter(seg => !seg.isChapterTitle), ...chapterSegments]);
    
    // Simulate API delay then set as not processing
    setTimeout(() => {
      setAiIsProcessing(false);
    }, 2000);
  };
  
  const markAsKeyPoint = (id: number) => {
    setTranscription(prev => 
      prev.map(segment => 
        segment.id === id 
          ? {...segment, isKey: !segment.isKey} 
          : segment
      )
    );
  };
  
  // Add new function to play audio for a specific chapter/segment
  const playSegmentAudio = (timestamp: string) => {
    // In a real implementation, this would seek to the specific timestamp in the audio
    Alert.alert("Play Audio", `Playing from timestamp: ${timestamp}`);
    // Simulate audio playback
    // In a real app, you would use Audio.Sound to load and play the audio
  };
  
  const saveTranscription = async () => {
    // Save the transcription, audio file, and other metadata
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your recording');
      return;
    }
    
    try {
      // In a real app, you would save this data to a database or file system
      // For this demo, we'll simulate saving and navigate to the notes screen
      
      // Create a new note object
      const newNote = {
        id: Date.now().toString(),
        title: title,
        date: new Date().toLocaleDateString(),
        summary: aiSummary || 'No summary available',
        duration: formatTime(elapsedTime),
        tags: ['Recording'],
        emoji: '🎙️',
        chapters: transcription
          .filter(segment => segment.isKey)
          .map((segment, index) => ({
            title: `Key Point ${index + 1}`,
            emoji: '📝',
            duration: segment.timestamp,
            content: segment.content
          })),
        audioUri: audioUri,
        fullTranscription: transcription
      };
      
      // Here you would normally save to a database
      console.log('Saving note:', newNote);
      
      // Close save modal first
      setShowSaveModal(false);
      
      // Ask to generate summary if not already generated
      if (!aiSummary) {
        Alert.alert(
          "Generate Summary?",
          "Would you like to generate an AI summary of your recording?",
          [
            {
              text: "Skip",
              onPress: () => {
                console.log("Navigating to notes screen...");
                // Make sure to reset the app state
                setTitle('');
                setTranscription([]);
                setHighlightedSegments([]);
                setElapsedTime(0);
                router.replace('/notes');
              },
              style: "cancel"
            },
            {
              text: "Generate",
              onPress: () => {
                generateAISummary();
              }
            }
          ]
        );
      } else {
        // Reset and navigate
        setTitle('');
        setTranscription([]);
        setHighlightedSegments([]);
        setElapsedTime(0);
        console.log("Navigating to notes screen with summary...");
        router.replace('/notes');
      }
    } catch (error) {
      console.error('Error saving transcription:', error);
      Alert.alert('Error', 'Failed to save your recording. Please try again.');
    }
  };
  
  const AISummaryModal = () => {
    const colorScheme = useColorScheme();
    const isDark = darkMode || colorScheme === 'dark';
    const [isFullPageView, setIsFullPageView] = useState(false);
    const [activeChapter, setActiveChapter] = useState(null);
    const [progressPoints, setProgressPoints] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // This is for debugging only
    console.log('AI Summary Modal Rendering');
    console.log('AI Summary content:', aiSummary);
    console.log('AI Key Points:', aiKeyPoints);
    
    // Simple loading state
    if (aiIsProcessing) {
      return (
        <View style={styles.absoluteModalContainer}>
          <View style={styles.absoluteModalOverlay}>
            <View style={[styles.absoluteModalContent, isDark && styles.absoluteModalContentDark]}>
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingModalText, isDark && {color: '#FFF'}]}>
                  Generating AI Summary...
                </Text>
                <View style={styles.loadingDotsContainer}>
                  <View style={styles.loadingDot} />
                  <View style={[styles.loadingDot, {marginLeft: 8}]} />
                  <View style={[styles.loadingDot, {marginLeft: 8}]} />
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }

    const handleClose = () => {
      setShowAISummaryModal(false);
    };

    const handleSave = () => {
      setShowAISummaryModal(false);
      // Navigate to notes screen
      setTimeout(() => {
        setTitle('');
        setTranscription([]);
        setHighlightedSegments([]);
        setElapsedTime(0);
        router.replace('/notes');
      }, 300);
    };

    const toggleFullPageView = () => {
      setIsFullPageView(!isFullPageView);
    };

    // Award progress points for engagement
    const awardPoints = (points) => {
      setProgressPoints(prev => prev + points);
      if ((progressPoints + points) % 50 === 0) {
        // Show confetti for milestone achievements
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };

    // Get chapters from transcription
    const chapters = transcription
      .filter(segment => segment.isChapterTitle)
      .map(chapter => ({
        title: chapter.content,
        emoji: chapter.emoji || '📝',
        timestamp: chapter.timestamp,
      }));
    
    // Play audio from timestamp
    const playFromTimestamp = (timestamp) => {
      // In a real implementation, this would seek to a specific time
      console.log(`Playing from timestamp: ${timestamp}`);
      // Award points for listening to audio sections
      awardPoints(5);
    };
    
    // Render progress meter
    const renderProgressMeter = () => {
      return (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, isDark && {color: '#FFF'}]}>Learning Progress</Text>
            <Text style={styles.progressPoints}>{progressPoints} pts</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, {width: `${Math.min(progressPoints, 100)}%`}]} />
          </View>
          {showConfetti && (
            <View style={styles.confettiContainer}>
              <Text style={styles.confettiEmoji}>🎉</Text>
              <Text style={styles.confettiEmoji}>🎊</Text>
              <Text style={styles.confettiEmoji}>��</Text>
            </View>
          )}
        </View>
      );
    };
    
    // Render full-page view with interactive elements
    if (isFullPageView) {
      return (
        <View style={styles.absoluteModalContainer}>
          <View style={styles.absoluteModalOverlay}>
            <View style={[styles.fullPageContent, isDark && {backgroundColor: '#121212'}]}>
              {/* Header */}
              <View style={styles.fullPageHeader}>
                <Text style={[styles.fullPageTitle, isDark && {color: '#FFF'}]}>
                  Interactive Summary
                </Text>
                <View style={styles.fullPageActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={toggleFullPageView}
                  >
                    <Ionicons name="resize-outline" size={22} color={isDark ? '#FFF' : '#333'} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleClose}
                  >
                    <Ionicons name="close" size={22} color={isDark ? '#FFF' : '#333'} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Progress Meter */}
              {renderProgressMeter()}
              
              {/* Content */}
              <ScrollView style={styles.fullPageBody}>
                {/* Interactive Summary Section */}
                <View style={styles.interactiveSummarySection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionHeaderTitle, isDark && {color: '#FFF'}]}>
                      Summary
                    </Text>
                    <TouchableOpacity 
                      style={styles.audioPlayButton}
                      onPress={() => {
                        playFromTimestamp('00:00');
                        awardPoints(10);
                      }}
                    >
                      <Ionicons name="play-circle" size={24} color="#9CEE69" />
                      <Text style={styles.audioPlayText}>Play Full Summary</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={[styles.interactiveSummaryCard, isDark && {backgroundColor: '#333'}]}>
                    <Text style={[styles.interactiveSummaryText, isDark && {color: '#EEE'}]}>
                      {aiSummary}
                    </Text>
                    <TouchableOpacity 
                      style={styles.highlightButton}
                      onPress={() => awardPoints(5)}
                    >
                      <Ionicons name="bookmark-outline" size={18} color="#9CEE69" />
                      <Text style={styles.highlightButtonText}>Highlight as Important</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Interactive Key Points */}
                <View style={styles.interactiveKeyPointsSection}>
                  <Text style={[styles.sectionHeaderTitle, isDark && {color: '#FFF'}]}>
                    Key Points
                  </Text>
                  
                  {aiKeyPoints.map((point, index) => (
                    <View key={index} style={styles.keyPointCardContainer}>
                      <TouchableOpacity
                        style={[styles.keyPointCard, isDark && {backgroundColor: '#333'}]}
                        onPress={() => awardPoints(3)}
                      >
                        <Text style={styles.keyPointEmoji}>{point.substring(0, 2)}</Text>
                        <Text style={[styles.keyPointCardText, isDark && {color: '#EEE'}]}>
                          {point.substring(2)}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.keyPointActions}>
                        <TouchableOpacity 
                          style={styles.keyPointActionButton}
                          onPress={() => awardPoints(2)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={20} color="#9CEE69" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.keyPointActionButton}
                          onPress={() => awardPoints(2)}
                        >
                          <Ionicons name="star-outline" size={20} color="#FFB627" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
                
                {/* Timeline View with Chapters */}
                <View style={styles.timelineSection}>
                  <Text style={[styles.sectionHeaderTitle, isDark && {color: '#FFF'}]}>
                    Learning Journey
                  </Text>
                  
                  <View style={styles.timeline}>
                    {chapters.map((chapter, index) => (
                      <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineConnector}>
                          <View style={styles.timelineDot} />
                          {index < chapters.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                        
                        <TouchableOpacity 
                          style={[
                            styles.timelineContent,
                            isDark && {backgroundColor: '#333'},
                            activeChapter === index && styles.activeTimelineContent
                          ]}
                          onPress={() => {
                            setActiveChapter(index);
                            playFromTimestamp(chapter.timestamp);
                            awardPoints(5);
                          }}
                        >
                          <View style={styles.timelineHeader}>
                            <View style={styles.timelineEmojiContainer}>
                              <Text style={styles.timelineEmoji}>{chapter.emoji}</Text>
                            </View>
                            <View style={styles.timelineHeaderContent}>
                              <Text style={[styles.timelineChapterTitle, isDark && {color: '#FFF'}]}>
                                {chapter.title}
                              </Text>
                              <Text style={styles.timelineTimestamp}>
                                {chapter.timestamp}
                              </Text>
                            </View>
                            <Ionicons 
                              name="play-circle" 
                              size={24} 
                              color="#9CEE69" 
                              style={styles.timelinePlayIcon}
                            />
                          </View>
                          
                          {activeChapter === index && (
                            <View style={styles.timelineExpandedContent}>
                              <Text style={[styles.timelineExpandedText, isDark && {color: '#DDD'}]}>
                                This chapter covers important concepts related to {chapter.title.toLowerCase()}.
                                Listen to this section for better understanding.
                              </Text>
                              <View style={styles.timelineAchievement}>
                                <Ionicons name="trophy-outline" size={20} color="#FFB627" />
                                <Text style={styles.timelineAchievementText}>
                                  +5 points for exploring this chapter
                                </Text>
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Quiz Challenge */}
                <TouchableOpacity 
                  style={[styles.quizChallengeCard, isDark && {backgroundColor: '#2A3B3F'}]}
                  onPress={() => awardPoints(15)}
                >
                  <View style={styles.quizIcon}>
                    <Ionicons name="help-circle" size={30} color="#FFFFFF" />
                  </View>
                  <View style={styles.quizContent}>
                    <Text style={styles.quizTitle}>Quiz Challenge</Text>
                    <Text style={styles.quizDescription}>
                      Test your understanding and earn 15 points!
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </ScrollView>
              
              {/* Footer */}
              <View style={styles.fullPageFooter}>
                <TouchableOpacity 
                  style={styles.basicSaveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.basicSaveButtonText}>
                    Save & Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.absoluteModalContainer}>
        <View style={styles.absoluteModalOverlay}>
          <View style={[styles.basicModalContent, isDark && {backgroundColor: '#222'}]}>
            {/* Header */}
            <View style={styles.basicModalHeader}>
              <Text style={[styles.basicModalTitle, isDark && {color: '#FFF'}]}>
                AI Summary
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.fullPageButton}
                  onPress={toggleFullPageView}
                >
                  <Ionicons name="expand-outline" size={24} color={isDark ? '#FFF' : '#000'} />
                  <Text style={[styles.fullPageButtonText, isDark && {color: '#FFF'}]}>
                    Interactive View
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.basicModalBody}>
              {/* Summary Section */}
              <View style={styles.basicSection}>
                <Text style={[styles.basicSectionTitle, isDark && {color: '#FFF'}]}>
                  Summary
                </Text>
                <View style={[styles.basicSummaryBox, isDark && {backgroundColor: '#333'}]}>
                  <Text style={[styles.basicSummaryText, isDark && {color: '#EEE'}]}>
                    {aiSummary}
                  </Text>
                </View>
              </View>

              {/* Key Points Section */}
              <View style={styles.basicSection}>
                <Text style={[styles.basicSectionTitle, isDark && {color: '#FFF'}]}>
                  Key Points
                </Text>
                {aiKeyPoints.map((point, index) => (
                  <View 
                    key={index} 
                    style={[styles.basicKeyPointItem, isDark && {backgroundColor: '#333'}]}
                  >
                    <Text style={[styles.basicKeyPointText, isDark && {color: '#EEE'}]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Chapters Section */}
              {chapters.length > 0 && (
                <View style={styles.basicSection}>
                  <Text style={[styles.basicSectionTitle, isDark && {color: '#FFF'}]}>
                    Chapters
                  </Text>
                  {chapters.map((chapter, index) => (
                    <View 
                      key={index} 
                      style={[styles.basicChapterItem, isDark && {backgroundColor: '#333'}]}
                    >
                      <Text style={styles.basicChapterEmoji}>{chapter.emoji}</Text>
                      <View style={styles.basicChapterContent}>
                        <Text style={[styles.basicChapterTitle, isDark && {color: '#FFF'}]}>
                          {chapter.title}
                        </Text>
                        <Text style={[styles.basicChapterTimestamp, isDark && {color: '#999'}]}>
                          {chapter.timestamp}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.basicModalFooter}>
              <TouchableOpacity 
                style={styles.basicSaveButton}
                onPress={handleSave}
              >
                <Text style={styles.basicSaveButtonText}>
                  Save Notes & Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>
          {isRecording ? 'Recording' : 'New Recording'}
        </Text>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={[styles.recordingDot, isPaused && styles.recordingDotPaused]} />
            <Text style={[styles.timerText, darkMode && styles.timerTextDark]}>
              {formatTime(elapsedTime)}
            </Text>
          </View>
        )}
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.transcriptionContainer}
        contentContainerStyle={[
          styles.transcriptionContent,
          !isRecording && { justifyContent: 'center', flex: 1, paddingBottom: 180 }
        ]}
      >
        {isRecording && transcription.length > 0 ? (
          transcription.map(segment => (
            <TouchableOpacity 
              key={segment.id}
              style={[
                styles.transcriptionSegment,
                darkMode && styles.transcriptionSegmentDark,
                highlightedSegments.includes(segment.id) && styles.highlightedSegment,
                segment.isKey && styles.keyPointSegment,
                segment.isChapterTitle && styles.chapterSegment
              ]}
              onPress={() => highlightSegment(segment.id)}
              onLongPress={() => !segment.isChapterTitle && markAsKeyPoint(segment.id)}
            >
              <View style={styles.segmentHeader}>
                {segment.isChapterTitle ? (
                  <>
                    <Text style={styles.chapterEmoji}>{segment.emoji}</Text>
                    <Text style={[styles.chapterTitle, darkMode && styles.chapterTitleDark]}>{segment.content}</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.speakerName, darkMode && styles.speakerNameDark]}>{segment.speaker}</Text>
                    <Text style={[styles.timestamp, darkMode && styles.timestampDark]}>{segment.timestamp}</Text>
                  </>
                )}
              </View>
              {!segment.isChapterTitle && (
                <Text style={[
                  styles.segmentContent, 
                  darkMode && styles.segmentContentDark,
                  segment.isKey && styles.keyPointText
                ]}>
                  {segment.content}
                </Text>
              )}
              {segment.isChapterTitle && (
                <TouchableOpacity 
                  style={styles.chapterPlayButton}
                  onPress={() => playSegmentAudio(segment.timestamp)}
                >
                  <Play size={16} color={darkMode ? "#9CEE69" : "#4F8A3D"} />
                  <Text style={[styles.chapterPlayText, darkMode && styles.chapterPlayTextDark]}>Play Chapter</Text>
                </TouchableOpacity>
              )}
              {segment.isKey && !segment.isChapterTitle && (
                <View style={styles.keyPointBadge}>
                  <Text style={styles.keyPointBadgeText}>Key Point</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : !isRecording ? (
          <View style={styles.emptyStateContainer}>
            <View style={[styles.emptyStateIconContainer, darkMode && styles.emptyStateIconContainerDark]}>
              <Mic size={48} color="#9CEE69" />
            </View>
            <Text style={[styles.emptyStateTitle, darkMode && styles.emptyStateTitleDark]}>Ready to Record</Text>
            <Text style={[styles.emptyStateMessage, darkMode && styles.emptyStateMessageDark]}>
              Tap the record button below to start capturing your lecture with AI-powered transcription
            </Text>
            <View style={styles.dyslexiaFeaturesContainer}>
              <Text style={[styles.dyslexiaFeaturesTitle, darkMode && styles.dyslexiaFeaturesTitleDark]}>Dyslexia-Friendly Features:</Text>
              <View style={styles.featureItem}>
                <Clock size={20} color={darkMode ? "#9CEE69" : "#4F8A3D"} />
                <Text style={[styles.featureText, darkMode && styles.featureTextDark]}>Real-time transcription with timestamps</Text>
              </View>
              <View style={styles.featureItem}>
                <BookmarkPlus size={20} color={darkMode ? "#9CEE69" : "#4F8A3D"} />
                <Text style={[styles.featureText, darkMode && styles.featureTextDark]}>Highlight important sections with a tap</Text>
              </View>
              <View style={styles.featureItem}>
                <Brain size={20} color={darkMode ? "#9CEE69" : "#4F8A3D"} />
                <Text style={[styles.featureText, darkMode && styles.featureTextDark]}>AI-generated summaries and key points</Text>
              </View>
              <View style={styles.featureItem}>
                <Tag size={20} color={darkMode ? "#9CEE69" : "#4F8A3D"} />
                <Text style={[styles.featureText, darkMode && styles.featureTextDark]}>Mark key points with a long press</Text>
              </View>
            </View>
          </View>
        ) : isTranscribing ? (
          <View style={styles.loadingTranscription}>
            <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>Transcribing audio in real-time...</Text>
          </View>
        ) : (
          <View style={styles.loadingTranscription}>
            <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>Waiting for speech...</Text>
          </View>
        )}
      </ScrollView>
      
      <Animated.View 
        style={[
          styles.controlsContainer,
          animatedControlsStyle,
          isRecording && styles.recordingControlsContainer,
          darkMode && styles.controlsContainerDark
        ]}
      >
        {isRecording ? (
          <View style={styles.recordingControls}>
            <TouchableOpacity 
              style={[styles.controlButton, darkMode && styles.controlButtonDark]}
              onPress={pauseRecording}
            >
              {isPaused ? (
                <Play size={24} color={darkMode ? "#FFF" : "#000"} />
              ) : (
                <Pause size={24} color={darkMode ? "#FFF" : "#000"} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]}
              onPress={stopRecording}
            >
              <Stop size={24} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, darkMode && styles.controlButtonDark]}
              onPress={() => transcription.length > 0 && highlightSegment(transcription[transcription.length - 1].id)}
            >
              <BookmarkPlus size={24} color={darkMode ? "#FFF" : "#000"} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.startRecordingButton}
            onPress={startRecording}
          >
            <Mic size={32} color="#FFF" />
            <Text style={styles.startRecordingText}>Start Recording</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {/* Save Modal */}
      {showSaveModal && (
        <View style={styles.absoluteModalContainer}>
          <View style={styles.absoluteModalOverlay}>
            <View style={[styles.absoluteModalContent, darkMode && styles.absoluteModalContentDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>Save Recording</Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, darkMode && styles.inputLabelDark]}>Title</Text>
                <TextInput 
                  style={[styles.titleInput, darkMode && styles.titleInputDark]}
                  placeholder="Enter a title for your recording"
                  placeholderTextColor={darkMode ? "#777" : "#999"}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              
              <View style={styles.modalSummarySection}>
                <Text style={[styles.summaryLabel, darkMode && styles.summaryLabelDark]}>
                  Recording Summary
                </Text>
                <Text style={[styles.summaryText, darkMode && styles.summaryTextDark]}>
                  {`${formatTime(elapsedTime)} · ${transcription.length} segments · ${highlightedSegments.length} highlights`}
                </Text>
              </View>
              
              <View style={styles.aiSummaryOption}>
                <TouchableOpacity
                  style={[styles.aiSummaryButton, darkMode && styles.aiSummaryButtonDark]}
                  onPress={generateAISummary}
                >
                  <Brain size={20} color={darkMode ? "#FFF" : "#000"} />
                  <Text style={[styles.aiSummaryButtonText, darkMode && styles.aiSummaryButtonTextDark]}>
                    Generate AI Summary
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.aiSummaryDescription, darkMode && styles.aiSummaryDescriptionDark]}>
                  Create a dyslexia-friendly summary and extract key points
                </Text>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton, darkMode && styles.cancelButtonDark]}
                  onPress={() => setShowSaveModal(false)}
                >
                  <Text style={[styles.cancelButtonText, darkMode && styles.cancelButtonTextDark]}>Discard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveTranscription}
                >
                  <Save size={16} color="#000" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* AI Summary Modal */}
      {showAISummaryModal && <AISummaryModal />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerDark: {
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    color: '#000',
  },
  headerTitleDark: {
    color: '#FFF',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingDotPaused: {
    backgroundColor: '#666',
  },
  timerText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 28,
    color: '#000',
  },
  timerTextDark: {
    color: '#FFF',
  },
  transcriptionContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transcriptionContent: {
    paddingTop: 16,
    paddingBottom: 120, // Increased to ensure content is visible above tabs and controls
  },
  transcriptionSegment: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  transcriptionSegmentDark: {
    backgroundColor: '#333',
  },
  highlightedSegment: {
    backgroundColor: '#F7FFF2',
    borderLeftWidth: 3,
    borderLeftColor: '#9CEE69',
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  speakerName: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#444',
  },
  speakerNameDark: {
    color: '#FFF',
  },
  timestamp: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#666',
  },
  timestampDark: {
    color: '#999',
  },
  segmentContent: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  segmentContentDark: {
    color: '#FFF',
  },
  keyPointSegment: {
    backgroundColor: '#F7FFF2',
    borderLeftWidth: 3,
    borderLeftColor: '#9CEE69',
  },
  keyPointText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100, // Increased to ensure visibility above tab bar
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recordingControlsContainer: {
    bottom: 120, // Move even higher when recording
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDark: {
    backgroundColor: '#333',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalOverlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalContentDark: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 20,
    color: '#000',
    marginBottom: 12,
  },
  modalTitleDark: {
    color: '#FFF',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#555',
  },
  inputLabelDark: {
    color: '#999',
  },
  titleInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
  },
  titleInputDark: {
    backgroundColor: '#333',
  },
  modalSummarySection: {
    marginBottom: 24,
  },
  summaryLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#555',
  },
  summaryLabelDark: {
    color: '#999',
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
  },
  aiSummaryOption: {
    marginBottom: 24,
  },
  aiSummaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9CEE69',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  aiSummaryButtonDark: {
    backgroundColor: '#333',
  },
  aiSummaryButtonText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#000',
  },
  aiSummaryButtonTextDark: {
    color: '#FFF',
  },
  aiSummaryDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
  },
  aiSummaryDescriptionDark: {
    color: '#999',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#9CEE69',
  },
  saveButtonText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#000',
  },
  startRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9CEE69',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  startRecordingText: {
    color: '#FFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    marginLeft: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F8EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateIconContainerDark: {
    backgroundColor: '#333',
  },
  emptyStateTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateTitleDark: {
    color: '#FFF',
  },
  emptyStateMessage: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  emptyStateMessageDark: {
    color: '#999',
  },
  dyslexiaFeaturesContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F0F8EB',
    borderRadius: 12,
  },
  dyslexiaFeaturesTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  dyslexiaFeaturesTitleDark: {
    color: '#FFF',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#444',
  },
  featureTextDark: {
    color: '#FFF',
  },
  aiModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  aiModalContainerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  aiModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    paddingBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  aiModalContentDark: {
    backgroundColor: '#222',
  },
  modalActions: {
    marginTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primarySaveButton: {
    backgroundColor: '#9CEE69',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  primarySaveButtonDark: {
    backgroundColor: '#4F8A3D',
  },
  primarySaveButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  primarySaveButtonTextDark: {
    color: '#FFF',
  },
  chaptersList: {
    marginTop: 8,
  },
  chapterListItem: {
    backgroundColor: '#F8FFF2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#9CEE69',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chapterListItemDark: {
    backgroundColor: '#263322',
    borderColor: '#4F8A3D',
  },
  chapterListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chapterEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  chapterListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: 0.3,
  },
  chapterListTitleDark: {
    color: '#FFF',
  },
  chapterContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans-Regular',
    letterSpacing: 0.2,
  },
  chapterContentDark: {
    color: '#CCC',
  },
  chapterPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F9D7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C5E6A6',
  },
  chapterPlayButtonDark: {
    backgroundColor: '#364A30',
    borderColor: '#4F8A3D',
  },
  chapterPlayText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#4F8A3D',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  chapterPlayTextDark: {
    color: '#9CEE69',
  },
  keyPointsList: {
    marginTop: 8,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  bulletPoint: {
    fontSize: 20,
    color: '#9CEE69',
    marginRight: 10,
    marginTop: -4,
  },
  bulletPointDark: {
    color: '#4F8A3D',
  },
  keyPointItemText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    letterSpacing: 0.2,
  },
  keyPointItemTextDark: {
    color: '#DDD',
  },
  keyPointBadge: {
    backgroundColor: '#9CEE69',
    borderRadius: 12,
    padding: 4,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  keyPointBadgeText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#FFF',
  },
  loadingTranscription: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#666',
  },
  loadingTextDark: {
    color: '#FFF',
  },
  controlsContainerDark: {
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  summaryTextDark: {
    color: '#999',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonDark: {
    borderBottomColor: '#444',
  },
  activeTabButton: {
    backgroundColor: '#9CEE69',
  },
  activeTabButtonDark: {
    backgroundColor: '#333',
  },
  tabText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#555',
  },
  tabTextDark: {
    color: '#999',
  },
  activeTabText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#000',
  },
  activeTabTextDark: {
    color: '#FFF',
  },
  modalBody: {
    flex: 1,
    maxHeight: 400,
  },
  modalBodyContent: {
    padding: 16,
  },
  modalFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  summaryTextDark: {
    color: '#999',
  },
  chapterSegment: {
    backgroundColor: '#F7FFF2',
    borderLeftWidth: 3,
    borderLeftColor: '#9CEE69',
  },
  chapterTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#333',
  },
  chapterTitleDark: {
    color: '#FFF',
  },
  chapterEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  chapterPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F9D7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C5E6A6',
  },
  chapterPlayText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#4F8A3D',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  chapterPlayTextDark: {
    color: '#9CEE69',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainerDark: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  keyPointsList: {
    marginTop: 8,
  },
  closeButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  fixedModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 9999,
  },
  fixedModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fixedModalContentDark: {
    backgroundColor: '#333',
  },
  centeredModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
  },
  centeredModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  centeredModalContentDark: {
    backgroundColor: '#222',
  },
  absoluteModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  absoluteModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 10000,
  },
  absoluteModalContentDark: {
    backgroundColor: '#222',
  },
  aiProcessingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiProcessingText: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Medium',
    marginBottom: 20,
    color: '#333',
  },
  aiProcessingTextDark: {
    color: '#FFF',
  },
  loadingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9CEE69',
    margin: 5,
    opacity: 0.6,
  },
  loadingDot1: {
    animationName: 'bounce',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationDelay: '0s',
  },
  loadingDot2: {
    animationName: 'bounce',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationDelay: '0.2s',
  },
  loadingDot3: {
    animationName: 'bounce',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationDelay: '0.4s',
  },
  enhancedSummaryContainer: {
    padding: 6,
  },
  summaryVisualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(156, 238, 105, 0.15)',
    borderRadius: 12,
  },
  summaryVisualEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  summaryVisualTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#333',
  },
  summaryVisualTitleDark: {
    color: '#FFF',
  },
  summaryParagraphContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9CEE69',
  },
  enhancedSummaryText: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.3,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  summaryTips: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 198, 102, 0.15)',
    borderRadius: 12,
  },
  summaryTipsHeader: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  summaryTipsHeaderDark: {
    color: '#FFF',
  },
  summaryTipsText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  summaryTipsTextDark: {
    color: '#CCC',
  },
  enhancedKeyPointsList: {
    padding: 6,
  },
  keyPointsHeader: {
    padding: 16,
    backgroundColor: 'rgba(156, 238, 105, 0.15)',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  keyPointsHeaderTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#333',
  },
  keyPointsHeaderTitleDark: {
    color: '#FFF',
  },
  enhancedKeyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  enhancedKeyPointItemDark: {
    backgroundColor: '#333',
  },
  enhancedKeyPointEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  enhancedKeyPointText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: 'PlusJakartaSans-Regular',
    flex: 1,
    letterSpacing: 0.3,
  },
  enhancedKeyPointTextDark: {
    color: '#EEE',
  },
  keyPointsFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  keyPointsExportButton: {
    backgroundColor: '#9CEE69',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  keyPointsExportText: {
    color: '#333',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
  },
  enhancedChapterListItem: {
    backgroundColor: '#F8FFF2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#9CEE69',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedChapterListItemDark: {
    backgroundColor: '#263322',
  },
  chapterEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(156, 238, 105, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterHeaderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chapterTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  chapterTimestampDark: {
    color: '#AAA',
  },
  enhancedChapterPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 238, 105, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(156, 238, 105, 0.4)',
  },
  enhancedChapterPlayButtonDark: {
    backgroundColor: 'rgba(79, 138, 61, 0.3)',
    borderColor: 'rgba(156, 238, 105, 0.3)',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingModalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  basicModalContent: {
    backgroundColor: '#FFF',
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  basicModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  basicModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  basicModalBody: {
    padding: 16,
    maxHeight: 500,
  },
  basicSection: {
    marginBottom: 24,
  },
  basicSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  basicSummaryBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  basicSummaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  basicKeyPointItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  basicKeyPointText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  basicChapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  basicChapterEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  basicChapterContent: {
    flex: 1,
  },
  basicChapterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  basicChapterTimestamp: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  basicModalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  basicSaveButton: {
    backgroundColor: '#9CEE69',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  basicSaveButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(156, 238, 105, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  fullPageButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  fullPageContent: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  fullPageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  fullPageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  fullPageActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 238, 105, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  fullPageBody: {
    flex: 1,
    padding: 16,
  },
  fullPageFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  progressContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CEE69',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#EFEFEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9CEE69',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  audioPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioPlayText: {
    fontSize: 14,
    color: '#9CEE69',
    marginLeft: 5,
  },
  interactiveSummarySection: {
    marginBottom: 24,
  },
  interactiveSummaryCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  interactiveSummaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  highlightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: 'rgba(156, 238, 105, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  highlightButtonText: {
    fontSize: 14,
    color: '#4F8A3D',
    marginLeft: 5,
  },
  interactiveKeyPointsSection: {
    marginBottom: 24,
  },
  keyPointCardContainer: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  keyPointCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyPointEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  keyPointCardText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  keyPointActions: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  keyPointActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(156, 238, 105, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timelineSection: {
    marginBottom: 24,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineConnector: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#9CEE69',
    marginTop: 16,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#9CEE69',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
  },
  activeTimelineContent: {
    borderWidth: 2,
    borderColor: '#9CEE69',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 238, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineEmoji: {
    fontSize: 20,
  },
  timelineHeaderContent: {
    flex: 1,
  },
  timelineChapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timelineTimestamp: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  timelinePlayIcon: {
    marginLeft: 8,
  },
  timelineExpandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  timelineExpandedText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  timelineAchievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255, 182, 39, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  timelineAchievementText: {
    fontSize: 14,
    color: '#AA7400',
    marginLeft: 8,
  },
  quizChallengeCard: {
    backgroundColor: '#4F8A3D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quizContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: '#FFF',
  },
  confettiContainer: {
    position: 'absolute',
    top: -20,
    right: 0,
    flexDirection: 'row',
  },
  confettiEmoji: {
    fontSize: 30,
    marginLeft: 5,
  },
});