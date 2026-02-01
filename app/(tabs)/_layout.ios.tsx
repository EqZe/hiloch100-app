
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="course" name="course">
        <Icon sf="book.fill" drawable="school" />
        <Label>הכנה לטסט</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="counter" name="counter">
        <Icon sf="calendar" drawable="calendar-today" />
        <Label>ספירת ימים</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
