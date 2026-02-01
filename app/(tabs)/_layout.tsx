
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: 'course',
      route: '/(tabs)/course',
      icon: 'school',
      label: 'הכנה לטסט',
    },
    {
      name: 'counter',
      route: '/(tabs)/counter',
      icon: 'calendar-today',
      label: 'ספירת ימים',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="course" name="course" />
        <Stack.Screen key="counter" name="counter" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
