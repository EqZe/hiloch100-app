
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  I18nManager,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';

// Force RTL for Android
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width: screenWidth } = Dimensions.get('window');

export interface TabBarItem {
  name: string;
  route: Href;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = screenWidth * 0.85,
  borderRadius = 24,
  bottomMargin
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const animatedValue = useSharedValue(0);

  const activeTabIndex = React.useMemo(() => {
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;

      if (pathname === tab.route) {
        score = 100;
      } else if (pathname.startsWith(tab.route as string)) {
        score = 80;
      } else if (pathname.includes(tab.name)) {
        score = 60;
      } else if (tab.route.includes('/(tabs)/') && pathname.includes(tab.route.split('/(tabs)/')[1])) {
        score = 40;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    if (activeTabIndex >= 0) {
      animatedValue.value = withSpring(activeTabIndex, {
        damping: 18,
        stiffness: 100,
        mass: 0.8,
      });
    }
  }, [activeTabIndex, animatedValue]);

  const handleTabPress = (route: Href) => {
    console.log('User tapped tab (Android RTL):', route);
    router.push(route);
  };

  const tabWidthPercent = ((100 / tabs.length) - 2).toFixed(2);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (containerWidth - 16) / tabs.length;
    // For RTL, we need to reverse the direction
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, tabs.length - 1],
            [tabWidth * (tabs.length - 1), 0] // Reversed for RTL
          ),
        },
      ],
    };
  });

  const dynamicStyles = {
    blurContainer: {
      ...styles.blurContainer,
      borderWidth: 0,
      backgroundColor: theme.dark
        ? 'rgba(28, 28, 30, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
      elevation: 12,
    },
    background: {
      ...styles.background,
    },
    indicator: {
      ...styles.indicator,
      backgroundColor: theme.dark
        ? 'rgba(79, 195, 247, 0.15)'
        : 'rgba(79, 195, 247, 0.12)',
      width: `${tabWidthPercent}%` as `${number}%`,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[
        styles.container,
        {
          width: containerWidth,
          marginBottom: bottomMargin ?? 16
        }
      ]}>
        <BlurView
          intensity={90}
          style={[dynamicStyles.blurContainer, { borderRadius }]}
        >
          <View style={dynamicStyles.background} />
          <Animated.View style={[dynamicStyles.indicator, indicatorStyle]} />
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;

              return (
                <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => handleTabPress(tab.route)}
                  activeOpacity={0.6}
                >
                  <View style={styles.tabContent}>
                    <MaterialIcons
                      name={tab.icon}
                      size={26}
                      color={isActive ? '#4FC3F7' : (theme.dark ? '#8E8E93' : '#8E8E93')}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: theme.dark ? '#8E8E93' : '#8E8E93' },
                        isActive && { color: '#4FC3F7', fontWeight: '700' },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  indicator: {
    position: 'absolute',
    top: 6,
    right: 8, // Changed from left to right for RTL
    bottom: 6,
    borderRadius: 18,
  },
  tabsContainer: {
    flexDirection: 'row-reverse', // RTL: reversed direction
    height: 68,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});
