
import React, { useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Linking, I18nManager, Image } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useWebView } from '@/contexts/WebViewContext';
import { colors } from '@/styles/commonStyles';
import LottieView from 'lottie-react-native';
import { usePathname } from 'expo-router';

// Enable RTL support for Hebrew
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function PersistentWebView() {
  const { webViewRef, isLoading, setIsLoading, showAccessDenied, setShowAccessDenied, accessGranted, setAccessGranted, setCurrentUrl, setIsWebViewLoaded, currentUrl, hasInitiallyLoaded, setHasInitiallyLoaded } = useWebView();
  const pathname = usePathname();
  const previousUrlRef = useRef<string>('');
  
  const isVisible = pathname === '/(tabs)/course' || pathname === '/course';

  // Check if we're on the hiloch100.co.il homepage
  const isOnHilochHomepage = currentUrl === 'https://hiloch100.co.il/' || currentUrl === 'https://hiloch100.co.il';

  // JavaScript to inject that prevents scrolling but keeps interactivity
  const injectedJavaScript = isOnHilochHomepage ? `
    (function() {
      // Prevent scrolling while keeping touch events for links/buttons
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent scroll events
      window.addEventListener('scroll', function(e) {
        window.scrollTo(0, 0);
      }, { passive: false });
      
      // Prevent touch-based scrolling
      var startY = 0;
      document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
      }, { passive: true });
      
      document.addEventListener('touchmove', function(e) {
        var currentY = e.touches[0].pageY;
        // Only prevent if it's a scroll gesture (not a tap)
        if (Math.abs(currentY - startY) > 10) {
          e.preventDefault();
        }
      }, { passive: false });
      
      console.log('Scroll prevention injected for homepage');
    })();
    true;
  ` : '';

  useEffect(() => {
    console.log('PersistentWebView: Current pathname:', pathname, 'Visible:', isVisible);
  }, [pathname, isVisible]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    const newUrl = navState.url;
    console.log('PersistentWebView: Navigation state changed to:', newUrl);
    
    // Update current URL in context
    setCurrentUrl(newUrl);
    
    // Only reset isWebViewLoaded when navigating to a NEW URL (not on same-page updates)
    if (previousUrlRef.current !== newUrl) {
      console.log('PersistentWebView: URL changed from', previousUrlRef.current, 'to', newUrl, '- resetting isWebViewLoaded');
      setIsWebViewLoaded(false);
      previousUrlRef.current = newUrl;
    }
    
    const isCourseUrl = newUrl.includes('/course');
    const isHilochHomepage = newUrl === 'https://hiloch100.co.il/' || newUrl === 'https://hiloch100.co.il';
    const isLoginPage = newUrl.includes('/login');

    // Special handling for hiloch100.co.il homepage
    if (isHilochHomepage) {
      console.log('PersistentWebView: On hiloch100.co.il homepage - hiding navbar and showing content');
      setShowAccessDenied(false);
      // Don't set accessGranted to true here - navbar should stay hidden
      return;
    }

    // Special handling for login page - ALWAYS hide navbar
    if (isLoginPage) {
      console.log('PersistentWebView: On login page - hiding navbar');
      setAccessGranted(false); // Ensure navbar stays hidden
      setShowAccessDenied(false); // Don't show access denied overlay
      return;
    }

    // Parameter Check Logic - PRIORITY CHECK
    if (isCourseUrl) {
      console.log('PersistentWebView: Detected /course URL, checking mobileapp parameter...');
      
      // Parse URL parameters
      const urlParts = newUrl.split('?');
      if (urlParts.length > 1) {
        const urlParams = new URLSearchParams(urlParts[1]);
        const mobileAppParam = urlParams.get('mobileapp');
        
        console.log('PersistentWebView: mobileapp parameter value:', mobileAppParam);

        if (mobileAppParam === 'denied') {
          console.log('PersistentWebView: Access DENIED - mobileapp=denied detected - BLOCKING ENTIRE APP INCLUDING NAVBAR');
          setShowAccessDenied(true);
          setAccessGranted(false);
          return; // Block further navigation/checks
        } else if (mobileAppParam === 'granted') {
          console.log('PersistentWebView: Access GRANTED - mobileapp=granted detected - SHOWING NAVBAR AFTER PAGE LOADS');
          setShowAccessDenied(false);
          setAccessGranted(true); // Mark access as granted - navbar will show after page loads
        } else {
          console.log('PersistentWebView: No mobileapp parameter or invalid value - navbar remains hidden until granted');
        }
      } else {
        console.log('PersistentWebView: No URL parameters found - navbar remains hidden until granted');
      }
    }
  }, [setShowAccessDenied, setAccessGranted, setCurrentUrl, setIsWebViewLoaded]);

  const handleLoadStart = () => {
    console.log('PersistentWebView: Load started - hiding navbar');
    setIsLoading(true);
    // Don't reset isWebViewLoaded here - let handleNavigationStateChange handle it
  };

  const handleLoadEnd = () => {
    console.log('PersistentWebView: Load ended - page fully loaded, navbar can now show if access granted');
    setIsLoading(false);
    setIsWebViewLoaded(true); // Mark WebView as loaded - navbar can now show if access is granted
    setHasInitiallyLoaded(true); // Mark that we've loaded at least once
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('PersistentWebView: Error occurred:', nativeEvent);
    setIsLoading(false);
    setIsWebViewLoaded(false); // Don't show navbar on error
  };

  const handleContactTeam = useCallback(() => {
    const whatsappUrl = 'https://wa.me/9720584422101?text=%E2%80%8E%20%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%94%D7%95%D7%A1%D7%99%D7%A3%20%D7%AA%D7%95%D7%9B%D7%9F%20%D7%9C%D7%97%D7%91%D7%99%D7%9C%D7%AA%20%D7%94%D7%94%D7%9B%D7%A0%D7%94%20%D7%9C%D7%98%D7%A1%D7%98%20%D7%A9%D7%9C%D7%99';
    console.log('PersistentWebView: Opening WhatsApp contact link');
    Linking.openURL(whatsappUrl).catch(err => {
      console.error('PersistentWebView: Failed to open WhatsApp link:', err);
    });
  }, []);

  const bigTitleText = 'אופס... נכנסת באין כניסה!';
  const subtitleText = 'אינך זכאי להשתמש באפליקציית המובייל של הילוך מאה';
  const descriptionText = 'ניתן לפנות לצוות האתר לצורך שדרוג החבילה';
  const buttonText = 'צור קשר עם הצוות';

  return (
    <View style={[styles.container, !isVisible && styles.hidden]}>
      {/* WebView - hidden when access is denied */}
      <View style={[styles.webviewContainer, showAccessDenied && styles.webviewHidden]}>
        <WebView
          ref={webViewRef}
          source={!hasInitiallyLoaded ? { uri: 'https://hiloch100.co.il/course' } : undefined}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onNavigationStateChange={handleNavigationStateChange}
          onLoad={() => {
            console.log('PersistentWebView: WebView loaded successfully');
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          scrollEnabled={true}
          injectedJavaScript={injectedJavaScript}
          onMessage={(event) => {
            console.log('PersistentWebView: Message from WebView:', event.nativeEvent.data);
          }}
        />
      </View>

      {/* Loading Indicator */}
      {isLoading && !showAccessDenied && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={{ uri: 'https://hiloch100.co.il/Speedometer.json' }}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      )}

      {/* Access Denied Overlay - Persistent and Blocking - Covers ENTIRE APP including navbar */}
      {showAccessDenied && (
        <View style={styles.accessDeniedOverlay}>
          <View style={styles.accessDeniedContent}>
            {/* Block Image */}
            <Image
              source={require('@/assets/images/9cf58ec3-19a5-40b4-b6ea-d8be6a6c628e.png')}
              style={styles.accessDeniedImage}
              resizeMode="contain"
            />
            
            {/* Big Title */}
            <Text style={styles.accessDeniedBigTitle}>{bigTitleText}</Text>
            
            {/* Subtitle (Bold) */}
            <Text style={styles.accessDeniedSubtitle}>{subtitleText}</Text>
            
            {/* Description */}
            <Text style={styles.accessDeniedDescription}>{descriptionText}</Text>
            
            {/* Contact Button */}
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactTeam}
              activeOpacity={0.8}
            >
              <Text style={styles.contactButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
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
  webviewContainer: {
    flex: 1,
  },
  webviewHidden: {
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
  // Access Denied Overlay Styles - FULL SCREEN BLOCKING
  accessDeniedOverlay: {
    position: 'absolute',
    top: Platform.OS === 'android' ? -48 : 0, // Extend to cover Android top padding
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999, // Extremely high z-index to cover everything
  },
  accessDeniedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    maxWidth: 500,
  },
  accessDeniedImage: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  accessDeniedBigTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 34,
    writingDirection: 'rtl',
  },
  accessDeniedSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
    writingDirection: 'rtl',
  },
  accessDeniedDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    writingDirection: 'rtl',
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 250,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  contactButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
