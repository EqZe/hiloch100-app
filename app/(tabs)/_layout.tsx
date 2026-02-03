
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { WebViewProvider, useWebView } from '@/contexts/WebViewContext';

function TabLayoutContent() {
  const { showAccessDenied, accessGranted } = useWebView();

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

  // Navbar visibility logic:
  // - Hide if access is denied (showAccessDenied = true)
  // - Hide if access has NOT been granted yet (accessGranted = false)
  // - Show only when accessGranted = true AND showAccessDenied = false
  const shouldShowNavbar = accessGranted && !showAccessDenied;

  console.log('TabLayout: accessGranted:', accessGranted, 'showAccessDenied:', showAccessDenied, '- Navbar will be', shouldShowNavbar ? 'VISIBLE' : 'HIDDEN');

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
      {/* Only render FloatingTabBar when access is granted and not denied */}
      {shouldShowNavbar && <FloatingTabBar tabs={tabs} />}
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
