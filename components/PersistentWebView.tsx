
import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useWebView } from '@/contexts/WebViewContext';
import { colors } from '@/styles/commonStyles';
import LottieView from 'lottie-react-native';
import { usePathname } from 'expo-router';

export default function PersistentWebView() {
  const { webViewRef, isLoading, setIsLoading } = useWebView();
  const pathname = usePathname();
  
  const isVisible = pathname === '/(tabs)/course' || pathname === '/course';

  useEffect(() => {
    console.log('PersistentWebView: Current pathname:', pathname, 'Visible:', isVisible);
  }, [pathname, isVisible]);

  const handleLoadStart = () => {
    console.log('PersistentWebView: Load started');
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    console.log('PersistentWebView: Load ended');
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('PersistentWebView: Error occurred:', nativeEvent);
    setIsLoading(false);
  };

  return (
    <View style={[styles.container, !isVisible && styles.hidden]}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://hiloch100.co.il/course' }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onLoad={() => {
          console.log('PersistentWebView: WebView loaded successfully');
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={{ uri: 'https://hiloch100.co.il/Speedometer.json' }}
            autoPlay
            loop
            style={styles.lottie}
          />
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
});
