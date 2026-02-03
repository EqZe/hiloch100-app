
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import CircularProgress from '@/components/CircularProgress';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface GamifiedCounterProps {
  currentStage: 1 | 2 | 'completed';
  stage1Remaining: number;
  stage2Remaining: number;
  stage1Total: number;
  stage2Total: number;
  totalDaysCompleted: number;
  endDate: string;
}

export default function GamifiedCounter({
  currentStage,
  stage1Remaining,
  stage2Remaining,
  stage1Total,
  stage2Total,
  totalDaysCompleted,
  endDate,
}: GamifiedCounterProps) {
  console.log('GamifiedCounter: Rendering with stage', currentStage, 'stage1Remaining:', stage1Remaining, 'stage2Remaining:', stage2Remaining);

  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const getCurrentStageProgress = () => {
    if (currentStage === 1) {
      const completed = stage1Total - stage1Remaining;
      return (completed / stage1Total) * 100;
    } else if (currentStage === 2) {
      const completed = stage2Total - stage2Remaining;
      return (completed / stage2Total) * 100;
    }
    return 100;
  };

  const getCurrentStageRemaining = () => {
    if (currentStage === 1) return stage1Remaining;
    if (currentStage === 2) return stage2Remaining;
    return 0;
  };

  const currentProgress = getCurrentStageProgress();
  const currentRemaining = getCurrentStageRemaining();
  const currentProgressRounded = Math.round(currentProgress);

  console.log('GamifiedCounter: currentRemaining =', currentRemaining, 'currentProgressRounded =', currentProgressRounded);

  const getCurrentStageTitle = () => {
    if (currentStage === 1) return 'מלווה 24/7';
    if (currentStage === 2) return 'מלווה לילה';
    return 'הושלם';
  };

  const getCurrentStageColor = () => {
    if (currentStage === 'completed') return '#4CAF50';
    return '#4FC3F7';
  };

  const getMotivationalText = () => {
    if (currentStage === 'completed') {
      return 'כל הכבוד! סיימת את תקופת הליווי';
    }
    if (currentProgress < 25) {
      return 'התחלה מצוינת! המשך כך';
    }
    if (currentProgress < 50) {
      return 'אתה בדרך! המשך להתקדם';
    }
    if (currentProgress < 75) {
      return 'יותר ממחצית הדרך! כל הכבוד';
    }
    return 'כמעט שם! עוד קצת';
  };

  const handleCirclePress = () => {
    console.log('Circle pressed, flipping from', isFlipped ? 'percentage' : 'days', 'to', isFlipped ? 'days' : 'percentage');
    
    rotation.value = withTiming(rotation.value + 180, { duration: 600 });
    setIsFlipped(!isFlipped);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP
    );
    
    const opacity = interpolate(
      rotation.value % 360,
      [0, 89, 90, 180],
      [1, 1, 0, 0],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [180, 360],
      Extrapolation.CLAMP
    );
    
    const opacity = interpolate(
      rotation.value % 360,
      [0, 89, 90, 180],
      [0, 0, 1, 1],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const motivationalText = getMotivationalText();
  const stageTitle = getCurrentStageTitle();
  const stageColor = getCurrentStageColor();
  const hasNextStage = currentStage === 1 && stage2Remaining > 0;
  const nextStageText = 'השלב הבא: מלווה לילה';

  // Extract all text values BEFORE JSX (Atomic JSX rule)
  const daysRemainingText = String(currentRemaining);
  const percentageText = `${currentProgressRounded}%`;
  const daysLabel = 'ימים נותרו';
  const completedLabel = 'הושלם';

  console.log('GamifiedCounter: Displaying daysRemainingText =', daysRemainingText, 'percentageText =', percentageText);

  return (
    <View style={styles.container}>
      <View style={styles.mainCircleContainer}>
        <CircularProgress
          size={280}
          strokeWidth={20}
          progress={currentProgress}
          color={stageColor}
          backgroundColor="#E0E0E0"
          onPress={handleCirclePress}
        >
          <View style={styles.flipContainer}>
            <Animated.View style={[styles.flipSide, frontAnimatedStyle]} pointerEvents="none">
              <View style={styles.mainCircleContent}>
                <Text style={styles.endDateText}>{endDate}</Text>
                <Text style={styles.mainNumber}>{daysRemainingText}</Text>
                <Text style={styles.mainLabel}>{daysLabel}</Text>
                <View style={styles.stageIndicator}>
                  <Text style={styles.stageText}>{stageTitle}</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.flipSide, styles.flipSideBack, backAnimatedStyle]} pointerEvents="none">
              <View style={styles.mainCircleContent}>
                <Text style={styles.endDateText}>{endDate}</Text>
                <Text style={styles.mainNumber}>{percentageText}</Text>
                <Text style={styles.mainLabel}>{completedLabel}</Text>
                <View style={styles.stageIndicator}>
                  <Text style={styles.stageText}>{stageTitle}</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </CircularProgress>
      </View>

      {hasNextStage && (
        <Text style={styles.nextStageNote}>{nextStageText}</Text>
      )}

      <Text style={styles.motivationalText}>{motivationalText}</Text>

      {currentStage !== 'completed' && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarNightPeriod} />
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(totalDaysCompleted / (stage1Total + stage2Total)) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressBarText}>
              {Math.round((totalDaysCompleted / (stage1Total + stage2Total)) * 100)}% מהמסלול הושלם
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainCircleContainer: {
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#4FC3F7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 8px 30px rgba(79, 195, 247, 0.4)',
      },
    }),
  },
  flipContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  flipSideBack: {
    backfaceVisibility: 'hidden',
  },
  mainCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  endDateText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  mainNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 80,
  },
  mainLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  stageIndicator: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextStageNote: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4FC3F7',
    textAlign: 'center',
    marginBottom: 10,
  },
  motivationalText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  progressBarWrapper: {
    gap: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarNightPeriod: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#757575',
    borderRadius: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4FC3F7',
    borderRadius: 6,
    position: 'relative',
    zIndex: 1,
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
