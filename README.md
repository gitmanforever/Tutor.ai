# Tutor.ai: AI-Powered Learning Assistant for Neurodivergent Students

## 🧠 The Problem: Learning Gaps for Neurodivergent Students

Traditional classroom environments present significant challenges for neurodivergent students, particularly those with dyslexia. These students experience:

- **Information Processing Difficulties**: Struggling to process verbal lectures in real-time
- **Note-Taking Challenges**: Difficulty capturing important points while simultaneously listening
- **Content Organization Problems**: Trouble structuring information in a meaningful way
- **Cognitive Overload**: Becoming overwhelmed by dense, text-heavy educational materials
- **Retention Issues**: Challenges with memorizing and recalling key information

These barriers often lead to achievement gaps, decreased confidence, and educational disparities despite these students having normal or above-average intelligence.

## 💡 Our Solution: Tutor.ai

Tutor.ai is a mobile-first AI companion that transforms traditional learning materials into dyslexia-friendly, interactive content. Our application leverages cutting-edge AI to make learning accessible, engaging, and effective for neurodivergent learners.

### Key Features

#### 1. Lecture Capture & Transcription
- **Real-Time Audio Recording**: Capture in-person lectures with high-quality audio
- **AI-Powered Transcription**: Convert speech to text with speaker identification
- **Smart Highlighting**: Easily mark important segments during recording
- **Timestamp Navigation**: Jump to specific moments in recordings

#### 2. Intelligent Summarization
- **Dyslexia-Friendly Content Processing**: Restructures information for easier comprehension
- **Visual Chapter Breakdowns**: Organizes content with emojis and visual markers
- **Key Points Extraction**: Identifies and highlights essential concepts
- **Interactive Timeline**: Creates a visual representation of the lecture structure

#### 3. Gamified Learning Paths
- **Progression System**: Earn points for engagement with learning materials
- **Interactive Quizzes**: Test understanding with auto-generated questions
- **Achievement Tracking**: Visual progress indicators for motivation
- **Spaced Repetition**: Smart review scheduling based on comprehension

#### 4. Whiteboard Analysis
- **Visual Capture**: Scan physical whiteboards and diagrams
- **Content Extraction**: Convert handwritten notes to structured text
- **Diagram Simplification**: Break down complex visuals into digestible elements
- **Smart Organization**: Arrange captured information logically

#### 5. Online Learning Integration
- **YouTube Lecture Support**: Process online educational videos
- **Content Transformation**: Convert standard videos to accessible formats
- **Cross-Platform Compatibility**: Seamless experience across devices

## 🛠️ Technical Implementation

### Architecture Overview

Tutor.ai is built using React Native for cross-platform compatibility, with a focus on accessibility and performance:

```
Tutor.ai/
├── Frontend (React Native + Expo)
│   ├── UI Components (Accessibility-optimized)
│   ├── Audio Processing Middleware
│   └── Local Storage Management
├── Backend Services
│   ├── OpenAI Integration
│   ├── Media Processing Pipeline
│   └── User Data Management
└── AI Models
    ├── Speech-to-Text (OpenAI Whisper)
    ├── Content Summarization (GPT-4)
    └── Image Recognition (Vision API)
```

### AI/ML Components

#### Speech Recognition & Transcription
- **Technology**: OpenAI Whisper API
- **Features**: 
  - Multi-speaker identification
  - Background noise filtering
  - Punctuation and formatting inference
  - Real-time chunked processing for longer recordings

#### Content Summarization & Transformation
- **Technology**: OpenAI GPT-4
- **Implementation**: 
  - Custom prompt engineering for dyslexia-friendly outputs
  - Chapter detection and organization
  - Key point extraction with emotional context preservation
  - Emoji integration for visual signposting

#### Visual Processing
- **Technology**: Computer Vision + GPT-4 Vision
- **Capabilities**:
  - Whiteboard text extraction
  - Diagram identification and simplification
  - Handwriting recognition
  - Spatial relationship mapping

### Optimization for Neurodivergent Users

- **Font Selection**: Using dyslexia-friendly fonts and customizable typography
- **Color Schemes**: High-contrast options with adjustable color palettes
- **Text Spacing**: Enhanced letter/word spacing for improved readability
- **Animation Control**: Options to reduce motion for users with sensory sensitivities
- **Audio Processing**: Adjustable playback speed and voice modulation

## 🚀 Impact & Use Cases

### Classroom Support
- Students can record lectures while focusing on understanding rather than note-taking
- Automatic organization of lecture content helps with study preparation
- Visual learning paths make revision more engaging and effective

### Independent Learning
- Transform YouTube educational content into accessible learning materials
- Capture and simplify complex whiteboard explanations
- Create personalized study guides with interactive elements

### Long-term Benefits
- Develops independent learning strategies
- Builds confidence through achievement tracking
- Reduces cognitive load while improving information retention

## 📊 Research & Effectiveness

Our approach is grounded in research on neurodivergent learning strategies:

- **Multisensory Learning**: Combining visual, auditory, and interactive elements
- **Cognitive Load Theory**: Reducing extraneous processing demands
- **Achievement Motivation**: Using gamification to increase engagement
- **Universal Design for Learning**: Creating multiple paths to understanding

## 🔮 Future Development

- **Collaborative Features**: Share and collaborate on notes with peers
- **Educator Portal**: Allow teachers to upload materials directly
- **Expanded Subject Support**: Specialized tools for STEM, languages, and arts
- **Offline Processing**: Reduce dependency on internet connectivity
- **Advanced Analytics**: Personalized insights into learning patterns

## 🤝 Dev

Shreyash Srivatsva

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Developed with ❤️ for the one who needs it. 
