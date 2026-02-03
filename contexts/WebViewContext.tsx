
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { WebView } from 'react-native-webview';

interface WebViewContextType {
  webViewRef: React.RefObject<WebView> | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showAccessDenied: boolean;
  setShowAccessDenied: (show: boolean) => void;
}

const WebViewContext = createContext<WebViewContextType>({
  webViewRef: null,
  isLoading: true,
  setIsLoading: () => {},
  showAccessDenied: false,
  setShowAccessDenied: () => {},
});

export function WebViewProvider({ children }: { children: ReactNode }) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  console.log('WebViewProvider: Initialized with loading state:', isLoading, 'Access denied:', showAccessDenied);

  return (
    <WebViewContext.Provider value={{ webViewRef, isLoading, setIsLoading, showAccessDenied, setShowAccessDenied }}>
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
