
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

  // Check if we're on the hiloch100.co.il homepage
  const isOnHilochHomepage = currentUrl === 'https://hiloch100.co.il/' || currentUrl === 'https://hiloch100.co.il';
  
  // Check if we're on the login page
  const isOnLoginPage = currentUrl.includes('/login');

  // Navbar visibility logic:
  // - Hide if access is denied (showAccessDenied = true)
  // - Hide if on hiloch100.co.il homepage (isOnHilochHomepage = true)
  // - Hide if on login page (isOnLoginPage = true)
  // - Hide if access has NOT been granted yet (accessGranted = false)
  // - Hide if WebView page has NOT finished loading yet (isWebViewLoaded = false)
  // - Show only when ALL conditions are met: accessGranted = true AND showAccessDenied = false AND NOT on homepage AND NOT on login page AND isWebViewLoaded = true
  const shouldShowNavbar = accessGranted && !showAccessDenied && !isOnHilochHomepage && !isOnLoginPage && isWebViewLoaded;

  console.log('TabLayout (iOS): accessGranted:', accessGranted, 'showAccessDenied:', showAccessDenied, 'currentUrl:', currentUrl, 'isOnHilochHomepage:', isOnHilochHomepage, 'isOnLoginPage:', isOnLoginPage, 'isWebViewLoaded:', isWebViewLoaded, '- Navbar will be', shouldShowNavbar ? 'VISIBLE' : 'HIDDEN');

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
      {/* Only render FloatingTabBar when access is granted, not denied, not on homepage, not on login page, AND page has loaded */}
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
