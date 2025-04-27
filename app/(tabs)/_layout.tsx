import { useRef } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Home, FileText, Settings, Mic, Youtube } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function TabBarIcon({ 
  Icon, 
  color, 
  size = 22, 
  focused = false 
}: { 
  Icon: any; 
  color: string; 
  size?: number; 
  focused?: boolean;
}) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Icon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

export default function TabLayout() {
  const { darkMode } = useTheme();
  
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: [styles.tabBar, darkMode && styles.tabBarDark],
        tabBarActiveTintColor: darkMode ? '#FFF' : '#000000',
        tabBarInactiveTintColor: darkMode ? '#777777' : '#777777',
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Home} color={color} focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabBarLabel, 
              focused ? (darkMode ? styles.tabBarLabelActiveDark : styles.tabBarLabelActive) : styles.tabBarLabelInactive
            ]}>
              Home
            </Text>
          ),
        }}
        listeners={{
          tabPress: () => triggerHaptic(),
        }}
      />

      <Tabs.Screen
        name="transcribe"
        options={{
          title: 'Record',
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={styles.recordButton}
              onPress={(e) => {
                triggerHaptic();
                props.onPress?.(e);
              }}
            >
              <View style={[styles.recordButtonInner, darkMode && styles.recordButtonInnerDark]}>
                <Mic size={24} color={darkMode ? "#FFF" : "#000"} strokeWidth={2.5} />
              </View>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={FileText} color={color} focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabBarLabel, 
              focused ? (darkMode ? styles.tabBarLabelActiveDark : styles.tabBarLabelActive) : styles.tabBarLabelInactive
            ]}>
              Notes
            </Text>
          ),
        }}
        listeners={{
          tabPress: () => triggerHaptic(),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Settings} color={color} focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabBarLabel, 
              focused ? (darkMode ? styles.tabBarLabelActiveDark : styles.tabBarLabelActive) : styles.tabBarLabelInactive
            ]}>
              Settings
            </Text>
          ),
        }}
        listeners={{
          tabPress: () => triggerHaptic(),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingBottom: 20,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  tabBarDark: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
  },
  tabBarLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    marginTop: -2,
  },
  tabBarLabelActive: {
    color: '#000000',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  tabBarLabelActiveDark: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  tabBarLabelInactive: {
    color: '#777777',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    width: 40,
    height: 40,
  },
  iconContainerFocused: {
    backgroundColor: '#F0F8EB',
  },
  recordButton: {
    top: -26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9CEE69',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  recordButtonInnerDark: {
    backgroundColor: '#7AC246',
  },
});