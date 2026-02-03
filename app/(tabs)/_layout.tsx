
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { WebViewProvider, useWebView } from '@/contexts/WebViewContext';

function TabLayoutContent() {
  const { showAccessDenied } = useWebView();

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

  console.log('TabLayout: showAccessDenied state:', showAccessDenied, '- Navbar will be', showAccessDenied ? 'HIDDEN' : 'VISIBLE');

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
      {/* Only render FloatingTabBar when access is NOT denied */}
      {!showAccessDenied && <FloatingTabBar tabs={tabs} />}
    </>
  );
}

export default function TabLayout() {
  return (
    <WebViewProvider>
      <TabLayoutContent />
    </WebViewProvider>
  );
}
