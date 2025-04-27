import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Clock, Calendar, Play, MoveVertical as MoreVertical, BookOpen, AlertCircle, ChevronDown, X, Edit3, Pencil, Trash, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Chapter = {
  title: string;
  emoji: string;
  duration: string;
};

type Note = {
  id: string;
  title: string;
  date: string;
  summary: string;
  duration: string;
  tags: string[];
  emoji: string;
  chapters: Chapter[];
  keyPoints?: string[];
  imageUri?: string;
};

const MOCK_NOTES = [
  {
    id: '1',
    title: 'Biology 101: Cell Structure',
    date: 'Oct 15, 2023',
    summary: 'This lecture covered the basic components of cells including the cell membrane, nucleus, and various organelles. We discussed how plant and animal cells differ in structure.',
    duration: '45 min',
    tags: ['Science', 'Important'],
    emoji: '🧬',
    chapters: [
      { title: 'Cell Components', emoji: '🔬', duration: '15min' },
      { title: 'Cell Membrane', emoji: '🧫', duration: '10min' },
      { title: 'Plant vs Animal Cells', emoji: '🌱', duration: '12min' },
      { title: 'Cell Function', emoji: '⚙️', duration: '8min' }
    ]
  },
  {
    id: '2',
    title: 'History: World War II',
    date: 'Oct 14, 2023',
    summary: 'An overview of the major events, causes, and consequences of World War II. Covered the rise of fascism, major battles, and the aftermath of the war.',
    duration: '50 min',
    tags: ['History'],
    emoji: '📚',
    chapters: [
      { title: 'Causes', emoji: '🔍', duration: '12min' },
      { title: 'Major Battles', emoji: '⚔️', duration: '20min' },
      { title: 'Allied Forces', emoji: '🗺️', duration: '8min' },
      { title: 'Aftermath', emoji: '🏛️', duration: '10min' }
    ]
  },
  {
    id: '3',
    title: 'Physics: Laws of Motion',
    date: 'Oct 12, 2023',
    summary: "Newton's three laws of motion were discussed, along with practical examples and applications. We also covered the concepts of force, mass, and acceleration.",
    duration: '40 min',
    tags: ['Physics', 'Exam Prep'],
    emoji: '🔭',
    chapters: [
      { title: 'First Law', emoji: '1️⃣', duration: '12min' },
      { title: 'Second Law', emoji: '2️⃣', duration: '14min' },
      { title: 'Third Law', emoji: '3️⃣', duration: '14min' }
    ]
  },
  {
    id: '4',
    title: 'Literature: Shakespeare',
    date: 'Oct 10, 2023',
    summary: 'Analysis of Shakespeare\'s most famous works with focus on themes, characters, and historical context. We specifically discussed Hamlet and Macbeth.',
    duration: '55 min',
    tags: ['Literature'],
    emoji: '📖',
    chapters: [
      { title: 'Life of Shakespeare', emoji: '👨‍🎨', duration: '10min' },
      { title: 'Hamlet Analysis', emoji: '💀', duration: '20min' },
      { title: 'Macbeth Themes', emoji: '👑', duration: '15min' },
      { title: 'Literary Techniques', emoji: '✍️', duration: '10min' }
    ]
  },
];

// Whiteboard Analysis Component
const WhiteboardAnalysisView = ({ analysis, keyPoints, imageUri }) => {
  const { darkMode } = useTheme();
  
  return (
    <View style={styles.analysisContainer}>
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.analysisImage}
          resizeMode="contain"
        />
      )}
      
      <View style={[styles.keyPointsContainer, darkMode && styles.keyPointsContainerDark]}>
        <Text style={[styles.keyPointsTitle, darkMode && styles.keyPointsTitleDark]}>
          Key Points
        </Text>
        {keyPoints.map((point, index) => (
          <View key={index} style={styles.keyPointItem}>
            <Text style={[styles.bulletPoint, darkMode && styles.bulletPointDark]}>•</Text>
            <Text style={[styles.keyPointText, darkMode && styles.keyPointTextDark]}>
              {point}
            </Text>
          </View>
        ))}
      </View>
      
      <Text style={[styles.analysisText, darkMode && styles.analysisTextDark]}>
        {analysis}
      </Text>
    </View>
  );
};

export default function NotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notes, setNotes] = useState(MOCK_NOTES);
  
  // Parse new note from params if available
  const [newNoteFromParams, setNewNoteFromParams] = useState(null);
  
  useEffect(() => {
    if (params.newNote) {
      try {
        const parsedNote = JSON.parse(params.newNote);
        setNewNoteFromParams(parsedNote);
        // Pre-populate the note fields
        setTitle(parsedNote.title || '');
        setContent(parsedNote.content || '');
      } catch (error) {
        console.error('Error parsing new note:', error);
      }
    }
  }, [params.newNote]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  const handleSave = () => {
    // Here you would normally save the note to storage
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Delete functionality
    router.back();
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchText.toLowerCase()) || 
                         note.summary.toLowerCase().includes(searchText.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'important') return matchesSearch && note.tags.includes('Important');
    if (selectedFilter === 'exam') return matchesSearch && note.tags.includes('Exam Prep');
    
    return matchesSearch;
  });
  
  const openNoteDetails = (note: any) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };
  
  const renderFilterButton = (id: string, label: string) => {
    const isActive = selectedFilter === id;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.activeFilterButton]}
        onPress={() => {
          setSelectedFilter(id);
          setShowFilterModal(false);
        }}
      >
        <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
      <Animated.View 
        entering={FadeInDown.duration(500).springify()}
        style={[styles.header, darkMode && styles.headerDark]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={darkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>
          {isEditing ? 'Edit Note' : 'View Note'}
        </Text>
        <View style={styles.headerRight}>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={[styles.saveButtonText, darkMode && styles.saveButtonTextDark]}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Pencil size={24} color={darkMode ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
          <Search size={20} color={darkMode ? "#777" : "#999"} />
          <TextInput
            style={[styles.searchInput, darkMode && styles.searchInputDark]}
            placeholder="Search notes..."
            placeholderTextColor={darkMode ? "#777" : "#999"}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={18} color={darkMode ? "#777" : "#999"} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color={darkMode ? "#FFF" : "#000"} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filtersRow}>
        {renderFilterButton('all', 'All Notes')}
        {renderFilterButton('important', 'Important')}
        {renderFilterButton('exam', 'Exam Prep')}
      </View>
      
      <ScrollView style={styles.notesContainer} contentContainerStyle={styles.notesContent}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note, index) => (
            <Animated.View 
              key={note.id} 
              entering={FadeInDown.delay(index * 100).duration(300)}
            >
              <TouchableOpacity 
                style={[styles.noteCard, darkMode && styles.noteCardDark]}
                onPress={() => openNoteDetails(note)}
              >
                <View style={styles.noteHeader}>
                  <View style={styles.emojiTitleContainer}>
                    <Text style={[styles.noteEmoji, darkMode && styles.noteEmojiDark]}>{note.emoji}</Text>
                    <Text style={[styles.noteTitle, darkMode && styles.noteTitleDark]}>{note.title}</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreVertical size={18} color={darkMode ? "#777" : "#999"} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.noteSummary, darkMode && styles.noteSummaryDark]} numberOfLines={2}>
                  {note.summary}
                </Text>
                
                <View style={styles.noteFooter}>
                  <View style={styles.noteMetaData}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color={darkMode ? "#777" : "#999"} />
                      <Text style={[styles.metaText, darkMode && styles.metaTextDark]}>{note.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={darkMode ? "#777" : "#999"} />
                      <Text style={[styles.metaText, darkMode && styles.metaTextDark]}>{note.duration}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tagsContainer}>
                    {note.tags.map((tag: string, idx: number) => (
                      <View 
                        key={idx} 
                        style={[
                          styles.tagBadge,
                          tag === 'Important' && styles.importantTag,
                          tag === 'Exam Prep' && styles.examTag,
                          darkMode && styles.tagBadgeDark
                        ]}
                      >
                        <Text 
                          style={[
                            styles.tagText,
                            tag === 'Important' && styles.importantTagText,
                            tag === 'Exam Prep' && styles.examTagText,
                            darkMode && styles.tagTextDark
                          ]}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyNotesContainer}>
            <BookOpen size={64} color="#CCC" />
            <Text style={[styles.emptyNotesText, darkMode && styles.emptyNotesTextDark]}>No notes found</Text>
            <Text style={[styles.emptyNotesSubtext, darkMode && styles.emptyNotesSubtextDark]}>
              Try adjusting your search or create a new note
            </Text>
          </View>
        )}
      </ScrollView>
      
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={[styles.modalOverlay, darkMode && styles.modalOverlayDark]}>
          <View style={[styles.filterModal, darkMode && styles.filterModalDark]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, darkMode && styles.filterTitleDark]}>Filter Notes</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={darkMode ? "#FFF" : "#000"} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.filterSectionTitle, darkMode && styles.filterSectionTitleDark]}>By Tag</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  darkMode && styles.filterOptionDark,
                  selectedFilter === 'all' && styles.activeFilterOption
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[styles.filterOptionText, darkMode && styles.filterOptionTextDark]}>All Notes</Text>
                {selectedFilter === 'all' && (
                  <View style={styles.filterCheckmark} />
                )}
              </TouchableOpacity>
              
              {['Important', 'Review', 'Science', 'History', 'Math'].map((tag, index) => (
              <TouchableOpacity 
                  key={tag}
                  style={[
                    styles.filterOption, 
                    darkMode && styles.filterOptionDark,
                    selectedFilter === tag && styles.activeFilterOption
                  ]}
                  onPress={() => setSelectedFilter(tag)}
              >
                  <Text style={[styles.filterOptionText, darkMode && styles.filterOptionTextDark]}>{tag}</Text>
                  {selectedFilter === tag && (
                    <View style={styles.filterCheckmark} />
                )}
              </TouchableOpacity>
              ))}
            </View>
              
              <TouchableOpacity 
              style={[styles.applyFilterButton, darkMode && styles.applyFilterButtonDark]}
              onPress={() => setShowFilterModal(false)}
              >
              <Text style={styles.applyFilterText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>
      
      <Modal
        visible={showNoteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowNoteModal(false);
          setSelectedNote(null);
        }}
      >
        {selectedNote && (
          <View style={[styles.noteModalContainer, darkMode && styles.noteModalContainerDark]}>
                <TouchableOpacity
              style={[styles.noteModalCloseButton, darkMode && styles.noteModalCloseButtonDark]}
              onPress={() => {
                setShowNoteModal(false);
                setSelectedNote(null);
              }}
                >
              <Text style={[styles.noteModalCloseText, darkMode && styles.noteModalCloseTextDark]}>×</Text>
                </TouchableOpacity>
                
            <ScrollView style={styles.noteModalContent}>
              <View style={styles.noteModalHeader}>
                <Text style={[styles.noteModalEmoji, darkMode && styles.noteModalEmojiDark]}>{selectedNote.emoji}</Text>
                <Text style={[styles.noteModalTitle, darkMode && styles.noteModalTitleDark]}>{selectedNote.title}</Text>
                <View style={styles.noteModalMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color={darkMode ? "#777" : "#999"} />
                    <Text style={[styles.metaText, darkMode && styles.metaTextDark]}>{selectedNote.date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={darkMode ? "#777" : "#999"} />
                    <Text style={[styles.metaText, darkMode && styles.metaTextDark]}>{selectedNote.duration}</Text>
                  </View>
                </View>
                
                <View style={styles.tagsRow}>
                  {selectedNote.tags.map((tag: string, idx: number) => (
                    <View 
                      key={idx} 
                      style={[
                        styles.tagBadge,
                        tag === 'Important' && styles.importantTag,
                        tag === 'Exam Prep' && styles.examTag,
                        darkMode && styles.tagBadgeDark
                      ]}
                    >
                      <Text 
                        style={[
                          styles.tagText,
                          tag === 'Important' && styles.importantTagText,
                          tag === 'Exam Prep' && styles.examTagText,
                          darkMode && styles.tagTextDark
                        ]}
                      >
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
                
              <View style={[styles.noteModalSummary, darkMode && styles.noteModalSummaryDark]}>
                <Text style={[styles.summaryTitle, darkMode && styles.summaryTitleDark]}>Summary</Text>
                {newNoteFromParams?.keyPoints && newNoteFromParams.imageUri ? (
                  // Render whiteboard analysis view if this is an analysis note
                  <WhiteboardAnalysisView 
                    analysis={selectedNote.summary}
                    keyPoints={newNoteFromParams.keyPoints}
                    imageUri={newNoteFromParams.imageUri}
                  />
                ) : (
                  <Text style={[styles.summaryText, darkMode && styles.summaryTextDark]}>{selectedNote.summary}</Text>
                )}
              </View>
              
              <View style={styles.chaptersSection}>
                <Text style={[styles.summaryTitle, darkMode && styles.summaryTitleDark]}>Chapters</Text>
                
                {selectedNote.chapters.map((chapter: Chapter, idx: number) => (
                  <View key={idx} style={styles.chapterItem}>
                    <View style={styles.chapterHeader}>
                      <View style={styles.chapterTitleContainer}>
                        <Text style={[styles.chapterEmoji, darkMode && styles.chapterEmojiDark]}>{chapter.emoji}</Text>
                        <Text style={[styles.chapterTitle, darkMode && styles.chapterTitleDark]}>{chapter.title}</Text>
                      </View>
                      <Text style={styles.chapterDuration}>{chapter.duration}</Text>
                    </View>
                    <View style={styles.chapterPlayButton}>
                      <Play size={16} color={darkMode ? "#777" : "#999"} />
                      <Text style={[styles.chapterPlayText, darkMode && styles.chapterPlayTextDark]}>Play</Text>
                    </View>
                  </View>
                ))}
                </View>
                
              <View style={styles.noteModalActions}>
                <TouchableOpacity style={[styles.noteActionButton, darkMode && styles.noteActionButtonDark]}>
                  <Play size={20} color={darkMode ? "#777" : "#999"} />
                  <Text style={[styles.noteActionButtonText, darkMode && styles.noteActionButtonTextDark]}>Play All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.noteActionButton, styles.noteActionButtonOutline, darkMode && styles.noteActionButtonOutlineDark]}>
                  <Text style={[styles.noteActionButtonOutlineText, darkMode && styles.noteActionButtonOutlineTextDark]}>Edit Note</Text>
                </TouchableOpacity>
              </View>
              </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#EEEEEE',
  },
  headerDark: {
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#000000',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  headerRight: {
    width: 70,
    alignItems: 'flex-end',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#3478F6',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
  },
  saveButtonTextDark: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarDark: {
    backgroundColor: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#333',
  },
  searchInputDark: {
    color: '#777',
  },
  filterIcon: {
    marginLeft: 12,
    padding: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeFilterButton: {
    backgroundColor: '#9CEE69',
  },
  filterButtonText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#000',
  },
  notesContainer: {
    flex: 1,
  },
  notesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  noteCardDark: {
    backgroundColor: '#333',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  emojiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noteEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  noteEmojiDark: {
    color: '#FFF',
  },
  noteTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    flex: 1,
  },
  noteTitleDark: {
    color: '#FFF',
  },
  moreButton: {
    padding: 4,
  },
  noteSummary: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteSummaryDark: {
    color: '#AAA',
  },
  noteFooter: {
    marginTop: 4,
  },
  noteMetaData: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#666',
  },
  metaTextDark: {
    color: '#AAA',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagBadgeDark: {
    backgroundColor: '#333',
  },
  importantTag: {
    backgroundColor: '#FFF0F0',
  },
  examTag: {
    backgroundColor: '#F0F8EB',
  },
  tagText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: '#666',
  },
  tagTextDark: {
    color: '#AAA',
  },
  importantTagText: {
    color: '#CC4444',
  },
  examTagText: {
    color: '#445511',
  },
  emptyNotesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyNotesText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyNotesTextDark: {
    color: '#AAA',
  },
  emptyNotesSubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyNotesSubtextDark: {
    color: '#AAA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  filterModalDark: {
    backgroundColor: '#333',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 18,
    color: '#000',
  },
  filterTitleDark: {
    color: '#FFF',
  },
  filterSectionTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  filterSectionTitleDark: {
    color: '#AAA',
  },
  filterOptions: {
    gap: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterOptionDark: {
    borderBottomColor: '#333',
  },
  filterOptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextDark: {
    color: '#AAA',
  },
  activeFilterOption: {
    backgroundColor: '#9CEE69',
  },
  filterCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    marginLeft: 8,
  },
  filterCheckmarkDark: {
    backgroundColor: '#FFF',
  },
  applyFilterButton: {
    backgroundColor: '#9CEE69',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  applyFilterButtonDark: {
    backgroundColor: '#444',
  },
  applyFilterText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
  noteModalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  noteModalContainerDark: {
    backgroundColor: '#333',
  },
  noteModalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteModalCloseButtonDark: {
    backgroundColor: '#444',
  },
  noteModalCloseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  noteModalCloseTextDark: {
    color: '#AAA',
  },
  noteModalContent: {
    flex: 1,
    padding: 20,
  },
  noteModalContentDark: {
    backgroundColor: '#444',
  },
  noteModalHeader: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  noteModalEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noteModalEmojiDark: {
    color: '#FFF',
  },
  noteModalTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  noteModalTitleDark: {
    color: '#FFF',
  },
  noteModalMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  noteModalSummary: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  noteModalSummaryDark: {
    backgroundColor: '#444',
  },
  summaryTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  summaryTitleDark: {
    color: '#FFF',
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  summaryTextDark: {
    color: '#AAA',
  },
  chaptersSection: {
    marginBottom: 24,
  },
  chaptersTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  chapterItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chapterItemDark: {
    backgroundColor: '#444',
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chapterHeaderDark: {
    borderBottomColor: '#333',
  },
  chapterHeaderActive: {
    backgroundColor: '#F0F8EB',
  },
  chapterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  chapterEmojiDark: {
    color: '#FFF',
  },
  chapterTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
  },
  chapterTitleDark: {
    color: '#FFF',
  },
  chapterDuration: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#666',
  },
  chapterPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterPlayText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  chapterPlayTextDark: {
    color: '#AAA',
  },
  noteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  noteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flex: 1,
    marginRight: 10,
  },
  noteActionButtonDark: {
    backgroundColor: '#444',
  },
  noteActionButtonText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
  noteActionButtonTextDark: {
    color: '#AAA',
  },
  noteActionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 0,
    marginLeft: 10,
  },
  noteActionButtonOutlineDark: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 0,
    marginLeft: 10,
  },
  noteActionButtonOutlineText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#000',
  },
  noteActionButtonOutlineTextDark: {
    color: '#AAA',
  },
  analysisContainer: {
    marginTop: 8,
  },
  analysisImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  analysisText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#333',
    lineHeight: 22,
    marginTop: 16,
  },
  analysisTextDark: {
    color: '#DDD',
  },
  keyPointsContainer: {
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
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
});