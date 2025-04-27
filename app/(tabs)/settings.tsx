import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Brain, Eye, Ear, HandMetal, Lock, Download, HelpCircle, LogOut, ChevronRight, Moon, Sun } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [offlineAccess, setOfflineAccess] = useState(true);
  const [learningStyle, setLearningStyle] = useState('visual');
  const { darkMode, setDarkMode } = useTheme();
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void,
    delay: number = 0
  ) => {
    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.settingItemDark]}
          onPress={onPress}
          disabled={!onPress}
        >
          <View style={styles.settingItemLeft}>
            <View style={[styles.settingIcon, darkMode && styles.settingIconDark]}>
              {icon}
            </View>
            <View>
              <Text style={[styles.settingTitle, darkMode && styles.settingTitleDark]}>
                {title}
              </Text>
              {description && (
                <Text style={[styles.settingDescription, darkMode && styles.settingDescriptionDark]}>
                  {description}
                </Text>
              )}
            </View>
          </View>
          {rightElement || <ChevronRight size={20} color={darkMode ? '#999' : '#666'} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const renderSwitch = (value: boolean, onValueChange: (value: boolean) => void) => {
    return (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#9CEE69' }}
        thumbColor="#FFF"
      />
    );
  };
  
  const renderLearningStyleOption = (
    id: string,
    label: string,
    Icon: any,
    description: string
  ) => {
    const isSelected = learningStyle === id;
    return (
      <TouchableOpacity
        style={[
          styles.learningStyleOption, 
          isSelected && styles.learningStyleOptionSelected,
          darkMode && styles.learningStyleOptionDark
        ]}
        onPress={() => setLearningStyle(id)}
      >
        <View style={styles.learningStyleHeader}>
          <Icon size={18} color={isSelected ? (darkMode ? '#FFF' : '#000') : '#666'} />
          <Text style={[
            styles.learningStyleLabel, 
            isSelected && styles.learningStyleLabelSelected,
            darkMode && styles.learningStyleLabelDark
          ]}>
            {label}
          </Text>
        </View>
        <Text style={[styles.learningStyleDescription, darkMode && styles.learningStyleDescriptionDark]}>
          {description}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Account</Text>
          {renderSettingItem(
            <User size={20} color={darkMode ? '#FFF' : '#000'} />,
            'Profile',
            'Edit your personal information',
            undefined,
            () => {},
            100
          )}
          {renderSettingItem(
            <Bell size={20} color={darkMode ? '#FFF' : '#000'} />,
            'Notifications',
            'Manage alerts and reminders',
            renderSwitch(notifications, setNotifications),
            undefined,
            200
          )}
        </View>
        
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Appearance</Text>
          {renderSettingItem(
            darkMode ? <Sun size={20} color="#FFF" /> : <Moon size={20} color="#000" />,
            'Dark Mode',
            'Switch between light and dark theme',
            renderSwitch(darkMode, setDarkMode),
            undefined,
            300
          )}
        </View>
        
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Learning Preferences</Text>
          
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={styles.learningStylesContainer}>
              <Text style={[styles.settingTitle, darkMode && styles.settingTitleDark]}>Learning Style</Text>
              <Text style={[styles.settingDescription, darkMode && styles.settingDescriptionDark]}>
                Choose how content is presented to you
              </Text>
              
              <View style={styles.learningStyleOptions}>
                {renderLearningStyleOption(
                  'visual',
                  'Visual',
                  Eye,
                  'Learn through images, charts, and visual content'
                )}
                {renderLearningStyleOption(
                  'auditory',
                  'Auditory',
                  Ear,
                  'Learn by listening to information and discussions'
                )}
                {renderLearningStyleOption(
                  'kinesthetic',
                  'Kinesthetic',
                  HandMetal,
                  'Learn through activities and hands-on experiences'
                )}
              </View>
            </View>
          </Animated.View>
          
          {renderSettingItem(
            <Brain size={20} color={darkMode ? '#FFF' : '#000'} />,
            'AI Preferences',
            'Customize summarization and highlighting',
            undefined,
            () => {},
            500
          )}
        </View>
        
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>App Settings</Text>
          {renderSettingItem(
            <Lock size={20} color={darkMode ? '#FFF' : '#000'} />,
            'Privacy & Security',
            'Manage permissions and data',
            undefined,
            () => {},
            600
          )}
          {renderSettingItem(
            <Download size={20} color={darkMode ? '#FFF' : '#000'} />,
            'Offline Access',
            'Download content for offline use',
            renderSwitch(offlineAccess, setOfflineAccess),
            undefined,
            700
          )}
        </View>
        
        <View style={[styles.section, darkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Support</Text>
          {renderSettingItem(
            <HelpCircle size={20} color={darkMode ? '#FFF' : '#000'} />,
            'Help & Feedback',
            'Contact support and send feedback',
            undefined,
            () => {},
            800
          )}
        </View>
        
        <Animated.View entering={FadeInDown.delay(900).duration(400)}>
          <TouchableOpacity style={[styles.logoutButton, darkMode && styles.logoutButtonDark]}>
            <LogOut size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Text style={[styles.versionText, darkMode && styles.versionTextDark]}>
          Tutor.ai v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerDark: {
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    color: '#000',
  },
  headerTitleDark: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionDark: {
    backgroundColor: '#000',
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#FFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemDark: {
    borderBottomColor: '#333',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingIconDark: {
    backgroundColor: '#333',
  },
  settingTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: '#000',
  },
  settingTitleDark: {
    color: '#FFF',
  },
  settingDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  settingDescriptionDark: {
    color: '#999',
  },
  learningStylesContainer: {
    marginBottom: 24,
  },
  learningStyleOptions: {
    marginTop: 12,
  },
  learningStyleOption: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  learningStyleOptionDark: {
    backgroundColor: '#1A1A1A',
  },
  learningStyleOptionSelected: {
    backgroundColor: '#F0F8EB',
  },
  learningStyleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  learningStyleLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
  learningStyleLabelDark: {
    color: '#999',
  },
  learningStyleLabelSelected: {
    color: '#000',
  },
  learningStyleDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  learningStyleDescriptionDark: {
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonDark: {
    backgroundColor: '#000',
  },
  logoutText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
  versionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  versionTextDark: {
    color: '#666',
  },
});