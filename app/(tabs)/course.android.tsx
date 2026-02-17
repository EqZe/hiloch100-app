
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import PersistentWebView from '@/components/PersistentWebView';

export default function CourseScreen() {
  console.log('CourseScreen (Android): Rendering course screen (WebView is persistent)');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <PersistentWebView />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 0, // SafeAreaView handles this on Android
  },
  content: {
    flex: 1,
  },
});
