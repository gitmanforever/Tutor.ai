import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const colorScheme = useColorScheme();
  
  useEffect(() => {
    // Load saved preference or use system preference
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('darkMode');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'true');
        } else {
          setDarkMode(colorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setDarkMode(colorScheme === 'dark');
      }
    };
    
    loadThemePreference();
  }, [colorScheme]);
  
  const setThemeAndSave = async (value: boolean) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem('darkMode', value.toString());
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode: setThemeAndSave }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 