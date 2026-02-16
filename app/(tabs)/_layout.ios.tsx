
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { WebViewProvider, useWebView } from '@/contexts/WebViewContext';

function TabLayoutContent() {
  const { showAccessDenied, accessGranted, currentUrl } = useWebView();

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
    {
      name: 'expenses',
      route: '/(tabs)/expenses',
      icon: 'receipt',
      label: 'הוצאות',
    },
  ];

  // Check if we're on the hiloch100.co.il homepage
  const isOnHilochHomepage = currentUrl === 'https://hiloch100.co.il/' || currentUrl === 'https://hiloch100.co.il';

  // Navbar visibility logic:
  // - Hide if access is denied (showAccessDenied = true)
  // - Hide if on hiloch100.co.il homepage (isOnHilochHomepage = true)
  // - Hide if access has NOT been granted yet (accessGranted = false)
  // - Show only when accessGranted = true AND showAccessDenied = false AND NOT on homepage
  const shouldShowNavbar = accessGranted && !showAccessDenied && !isOnHilochHomepage;

  console.log('TabLayout (iOS): accessGranted:', accessGranted, 'showAccessDenied:', showAccessDenied, 'currentUrl:', currentUrl, 'isOnHilochHomepage:', isOnHilochHomepage, '- Navbar will be', shouldShowNavbar ? 'VISIBLE' : 'HIDDEN');

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
        <Stack.Screen key="expenses" name="expenses" />
      </Stack>
      {/* Only render FloatingTabBar when access is granted, not denied, and not on homepage */}
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
