
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { WebView, WebViewNavigation, WebViewMessageEvent } from 'react-native-webview';
import { useWebView } from '@/contexts/WebViewContext';
import { colors } from '@/styles/commonStyles';
import LottieView from 'lottie-react-native';
import { usePathname } from 'expo-router';

const TARGET_URL = 'https://hiloch100.co.il/course';
const SECURITY_CHECK_DELAY = 7000; // 7 seconds

// JavaScript to inject into the WebView to check for the security element
const SECURITY_CHECK_SCRIPT = `
  (function() {
    try {
      const element = document.querySelector('div._df_book[data-slug="11689"]');
      const found = !!element;
      console.log('Security check: Element found =', found);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'SECURITY_CHECK_RESULT',
        found: found
      }));
    } catch (error) {
      console.error('Security check error:', error);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'SECURITY_CHECK_RESULT',
        found: false
      }));
    }
  })();
  true;
`;

export default function PersistentWebView() {
  const { webViewRef, isLoading, setIsLoading, showSecurityError, setShowSecurityError } = useWebView();
  const pathname = usePathname();
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const urlTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedRef = useRef(false);
  
  const isVisible = pathname === '/(tabs)/course' || pathname === '/course';

  useEffect(() => {
    console.log('PersistentWebView: Current pathname:', pathname, 'Visible:', isVisible);
  }, [pathname, isVisible]);

  // Clear timer when component unmounts or URL changes away from target
  useEffect(() => {
    return () => {
      if (urlTimerRef.current) {
        console.log('PersistentWebView: Clearing security check timer on cleanup');
        clearTimeout(urlTimerRef.current);
        urlTimerRef.current = null;
      }
    };
  }, []);

  const handleLoadStart = useCallback(() => {
    console.log('PersistentWebView: Load started');
    setIsLoading(true);
  }, [setIsLoading]);

  const handleLoadEnd = useCallback(() => {
    console.log('PersistentWebView: Load ended, current URL:', currentUrl);
    setIsLoading(false);
    
    // If we're on the target URL and the timer has been set (7 seconds have passed), inject the script
    if (currentUrl === TARGET_URL && urlTimerRef.current && !hasCheckedRef.current) {
      console.log('PersistentWebView: Injecting security check script');
      hasCheckedRef.current = true;
      webViewRef?.current?.injectJavaScript(SECURITY_CHECK_SCRIPT);
    }
  }, [setIsLoading, currentUrl, webViewRef]);

  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('PersistentWebView: Error occurred:', nativeEvent);
    setIsLoading(false);
  }, [setIsLoading]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    const newUrl = navState.url;
    console.log('PersistentWebView: Navigation state changed to:', newUrl);
    setCurrentUrl(newUrl);

    if (newUrl === TARGET_URL) {
      // User is on the target URL
      if (!urlTimerRef.current) {
        console.log('PersistentWebView: Starting 7-second security check timer');
        hasCheckedRef.current = false;
        urlTimerRef.current = setTimeout(() => {
          console.log('PersistentWebView: 7 seconds elapsed on target URL, ready to check on next load');
          // The actual injection will happen in handleLoadEnd
        }, SECURITY_CHECK_DELAY);
      }
    } else {
      // User navigated away from target URL
      if (urlTimerRef.current) {
        console.log('PersistentWebView: User navigated away, clearing timer and resetting security error');
        clearTimeout(urlTimerRef.current);
        urlTimerRef.current = null;
        hasCheckedRef.current = false;
      }
      setShowSecurityError(false);
    }
  }, [setShowSecurityError]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('PersistentWebView: Received message from WebView:', data);
      
      if (data.type === 'SECURITY_CHECK_RESULT') {
        if (!data.found) {
          console.log('PersistentWebView: Security element NOT found - showing error');
          setShowSecurityError(true);
        } else {
          console.log('PersistentWebView: Security element found - access granted');
          setShowSecurityError(false);
        }
      }
    } catch (e) {
      console.error('PersistentWebView: Failed to parse WebView message:', e);
    }
  }, [setShowSecurityError]);

  const errorMessageText = 'אינך רשאי לגשת לאפליקציה, יש לשדרג את חבילת ההכנה לטסט.';

  return (
    <View style={[styles.container, !isVisible && styles.hidden]}>
      <WebView
        ref={webViewRef}
        source={{ uri: TARGET_URL }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        onLoad={() => {
          console.log('PersistentWebView: WebView loaded successfully');
        }}
      />
      {isLoading && !showSecurityError && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={{ uri: 'https://hiloch100.co.il/Speedometer.json' }}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      )}
      {showSecurityError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{errorMessageText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  webview: {
    flex: 1,
    backgroundColor: colors.card,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
    lineHeight: 32,
  },
});
