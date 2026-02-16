
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { WebView } from 'react-native-webview';

interface WebViewContextType {
  webViewRef: React.RefObject<WebView> | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showAccessDenied: boolean;
  setShowAccessDenied: (show: boolean) => void;
  accessGranted: boolean;
  setAccessGranted: (granted: boolean) => void;
  currentUrl: string;
  setCurrentUrl: (url: string) => void;
  isWebViewLoaded: boolean;
  setIsWebViewLoaded: (loaded: boolean) => void;
}

const WebViewContext = createContext<WebViewContextType>({
  webViewRef: null,
  isLoading: true,
  setIsLoading: () => {},
  showAccessDenied: false,
  setShowAccessDenied: () => {},
  accessGranted: false,
  setAccessGranted: () => {},
  currentUrl: '',
  setCurrentUrl: () => {},
  isWebViewLoaded: false,
  setIsWebViewLoaded: () => {},
});

export function WebViewProvider({ children }: { children: ReactNode }) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  console.log('WebViewProvider: Initialized - loading:', isLoading, 'accessDenied:', showAccessDenied, 'accessGranted:', accessGranted, 'currentUrl:', currentUrl, 'isWebViewLoaded:', isWebViewLoaded);

  return (
    <WebViewContext.Provider value={{ 
      webViewRef, 
      isLoading, 
      setIsLoading, 
      showAccessDenied, 
      setShowAccessDenied,
      accessGranted,
      setAccessGranted,
      currentUrl,
      setCurrentUrl,
      isWebViewLoaded,
      setIsWebViewLoaded
    }}>
      {children}
    </WebViewContext.Provider>
  );
}

export function useWebView() {
  const context = useContext(WebViewContext);
  if (!context) {
    throw new Error('useWebView must be used within WebViewProvider');
  }
  return context;
}
