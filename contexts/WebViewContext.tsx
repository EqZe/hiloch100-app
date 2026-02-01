
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { WebView } from 'react-native-webview';

interface WebViewContextType {
  webViewRef: React.RefObject<WebView> | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const WebViewContext = createContext<WebViewContextType>({
  webViewRef: null,
  isLoading: true,
  setIsLoading: () => {},
});

export function WebViewProvider({ children }: { children: ReactNode }) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('WebViewProvider: Initialized with loading state:', isLoading);

  return (
    <WebViewContext.Provider value={{ webViewRef, isLoading, setIsLoading }}>
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
