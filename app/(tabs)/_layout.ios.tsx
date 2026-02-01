
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="course" name="course">
        <Stack.Screen
          name="course"
          options={{
            title: 'הכנה לטסט',
            headerShown: false,
          }}
        />
        <Icon sf="book.fill" drawable="school" />
        <Label>הכנה לטסט</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="counter" name="counter">
        <Stack.Screen
          name="counter"
          options={{
            title: 'ספירת ימי מלווה',
            headerShown: false,
          }}
        />
        <Icon sf="calendar" drawable="calendar-today" />
        <Label>ספירת ימים</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
