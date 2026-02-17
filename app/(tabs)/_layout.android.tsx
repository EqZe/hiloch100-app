
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { WebViewProvider, useWebView } from '@/contexts/WebViewContext';

function TabLayoutContent() {
  const { showAccessDenied, accessGranted, currentUrl, isWebViewLoaded } = useWebView();

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

  const isOnHilochHomepage = currentUrl === 'https://hiloch100.co.il/' || currentUrl === 'https://hiloch100.co.il';
  const isOnLoginPage = currentUrl.includes('/login');
  const shouldShowNavbar = accessGranted && !showAccessDenied && !isOnHilochHomepage && !isOnLoginPage && isWebViewLoaded;

  console.log('TabLayout (Android): accessGranted:', accessGranted, 'showAccessDenied:', showAccessDenied, 'currentUrl:', currentUrl, 'isOnHilochHomepage:', isOnHilochHomepage, 'isOnLoginPage:', isOnLoginPage, 'isWebViewLoaded:', isWebViewLoaded, '- Navbar will be', shouldShowNavbar ? 'VISIBLE' : 'HIDDEN');

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
