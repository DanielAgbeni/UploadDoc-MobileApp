import React from 'react';
import { Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { cn, createThemedClasses } from '../utils/classNames';

const ExampleComponent = () => {
  const { isDark, themed, getThemedClassName } = useTheme();
  
  // Method 1: Using the themed object from useTheme
  const method1Example = (
    <View className={`p-4 rounded-lg mb-4 ${themed.bg.background} ${themed.border.primary} border-2`}>
      <Text className={`text-lg font-bold mb-2 ${themed.text.primary}`}>
        Method 1: Using themed object
      </Text>
      <TouchableOpacity className={`px-4 py-2 rounded ${themed.bg.primary}`}>
        <Text className="text-white text-center">Primary Button</Text>
      </TouchableOpacity>
    </View>
  );

  // Method 2: Using createThemedClasses utility
  const themedClasses = createThemedClasses(isDark);
  const method2Example = (
    <View className={cn('p-4 rounded-lg mb-4 border-2', themedClasses.card)}>
      <Text className={cn('text-lg font-bold mb-2', themedClasses.textPrimary)}>
        Method 2: Using createThemedClasses
      </Text>
      <TouchableOpacity className={cn('px-4 py-2 rounded', themedClasses.button)}>
        <Text className="text-white text-center">Primary Button</Text>
      </TouchableOpacity>
    </View>
  );

  // Method 3: Using getThemedClassName for custom combinations
  const method3Example = (
    <View className={cn(
      'p-4 rounded-lg mb-4 border-2',
      getThemedClassName('bg-light-background border-light-primary', 'bg-dark-background border-dark-primary')
    )}>
      <Text className={cn(
        'text-lg font-bold mb-2',
        getThemedClassName('text-light-text', 'text-dark-text')
      )}>
        Method 3: Using getThemedClassName
      </Text>
      <TouchableOpacity className={cn(
        'px-4 py-2 rounded',
        getThemedClassName('bg-light-accent', 'bg-dark-accent')
      )}>
        <Text className="text-white text-center">Accent Button</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="p-4">
      <Text className={`text-2xl font-bold mb-6 text-center ${themed.text.primary}`}>
        Different Ways to Use Themed Classes
      </Text>
      
      {method1Example}
      {method2Example}
      {method3Example}
      
      {/* Input example */}
      <View className={`p-4 rounded-lg ${themed.bg.background} ${themed.border.secondary} border`}>
        <Text className={`text-base mb-2 ${themed.text.primary}`}>
          Input Example:
        </Text>
        <TextInput
          className={cn(
            'p-3 rounded border',
            themedClasses.input
          )}
          placeholder="Type something..."
          placeholderTextColor={isDark ? '#888' : '#666'}
        />
      </View>
    </View>
  );
};

export default ExampleComponent;
