
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { WebView } from 'react-native-webview';

interface WebViewContextType {
  webViewRef: React.RefObject<WebView> | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showSecurityError: boolean;
  setShowSecurityError: (show: boolean) => void;
}

const WebViewContext = createContext<WebViewContextType>({
  webViewRef: null,
  isLoading: true,
  setIsLoading: () => {},
  showSecurityError: false,
  setShowSecurityError: () => {},
});

export function WebViewProvider({ children }: { children: ReactNode }) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecurityError, setShowSecurityError] = useState(false);

  console.log('WebViewProvider: Initialized with loading state:', isLoading, 'Security error:', showSecurityError);

  return (
    <WebViewContext.Provider value={{ webViewRef, isLoading, setIsLoading, showSecurityError, setShowSecurityError }}>
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
