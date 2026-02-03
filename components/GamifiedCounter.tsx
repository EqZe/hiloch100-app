
import React, { useState, useCallback } from 'react';
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

  const rotation = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

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
  const currentRemainingText = String(currentRemaining);
  const percentageText = `${Math.round(currentProgress)}%`;

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

  const handleFlip = useCallback(() => {
    console.log('GamifiedCounter: Flip button pressed');
    if (rotation.value === 0) {
      rotation.value = withTiming(180, { duration: 600 });
      setIsFlipped(true);
    } else {
      rotation.value = withTiming(0, { duration: 600 });
      setIsFlipped(false);
    }
  }, [rotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      rotation.value,
      [0, 89, 90, 180],
      [1, 1, 0, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
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
      rotation.value,
      [0, 89, 90, 180],
      [0, 0, 1, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const showNextStageNote = currentStage === 1 && stage2Remaining > 0;
  const nextStageNoteText = 'השלב הבא: מלווה לילה';

  const overallProgress = (totalDaysCompleted / (stage1Total + stage2Total)) * 100;
  const overallProgressText = `${Math.round(overallProgress)}% מהליך הליווי הכולל הושלם`;

  const circleSize = 280;

  // Check if fully completed: both stages done (0 remaining days)
  const isFullyCompleted = stage1Remaining === 0 && stage2Remaining === 0 && currentStage === 'completed';
  
  console.log('GamifiedCounter: isFullyCompleted:', isFullyCompleted, 'currentStage:', currentStage);

  return (
    <View style={styles.container}>
      <View style={[styles.mainCircleContainer, { width: circleSize, height: circleSize }]}>
        <Animated.View 
          style={[
            styles.flipSide, 
            { width: circleSize, height: circleSize },
            frontAnimatedStyle,
            { zIndex: isFlipped ? 0 : 1 }
          ]} 
          pointerEvents={isFlipped ? 'none' : 'auto'}
        >
          <CircularProgress
            size={circleSize}
            strokeWidth={20}
            progress={currentProgress}
            color={getCurrentStageColor()}
            backgroundColor="#E0E0E0"
            onPress={handleFlip}
          >
            <View style={styles.mainCircleContent}>
              {isFullyCompleted ? (
                <View style={styles.completionContainer}>
                  <Text style={styles.completionTitle}>סיימת מלווה!</Text>
                  <Text style={styles.completionSubtitle}>תהנה עם הרישיון</Text>
                  <Text style={styles.completionBrand}>מהילוך מאה</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.endDateText}>{endDate}</Text>
                  <Text style={styles.mainNumber}>{currentRemainingText}</Text>
                  <Text style={styles.mainLabel}>ימים נותרו</Text>
                  <View style={styles.stageIndicator}>
                    <Text style={styles.stageText}>{getCurrentStageTitle()}</Text>
                  </View>
                </>
              )}
            </View>
          </CircularProgress>
        </Animated.View>

        <Animated.View 
          style={[
            styles.flipSide, 
            styles.flipSideBack, 
            { width: circleSize, height: circleSize },
            backAnimatedStyle,
            { zIndex: isFlipped ? 1 : 0 }
          ]} 
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          <CircularProgress
            size={circleSize}
            strokeWidth={20}
            progress={currentProgress}
            color={getCurrentStageColor()}
            backgroundColor="#E0E0E0"
            onPress={handleFlip}
          >
            <View style={styles.mainCircleContent}>
              {isFullyCompleted ? (
                <View style={styles.completionContainer}>
                  <Text style={styles.completionTitle}>סיימת מלווה!</Text>
                  <Text style={styles.completionSubtitle}>תהנה עם הרישיון</Text>
                  <Text style={styles.completionBrand}>מהילוך מאה</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.endDateText}>{endDate}</Text>
                  <Text style={styles.mainNumber}>{percentageText}</Text>
                  <Text style={styles.mainLabel}>הושלם</Text>
                  <View style={styles.stageIndicator}>
                    <Text style={styles.stageText}>{getCurrentStageTitle()}</Text>
                  </View>
                </>
              )}
            </View>
          </CircularProgress>
        </Animated.View>
      </View>

      {showNextStageNote && (
        <Text style={styles.nextStageNote}>{nextStageNoteText}</Text>
      )}

      <Text style={styles.motivationalText}>{getMotivationalText()}</Text>

      {currentStage !== 'completed' && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarNightSection} />
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${overallProgress}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressBarText}>{overallProgressText}</Text>
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
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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
  flipSide: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  flipSideBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
  completionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 12,
  },
  completionSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  completionBrand: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nextStageNote: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
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
  progressBarNightSection: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#9E9E9E',
    borderRadius: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4FC3F7',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    fontWeight: '900',
    ...Platform.select({
      ios: {
        shadowColor: '#4FC3F7',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 3px 12px rgba(79, 195, 247, 0.8)',
        fontWeight: 'bold',
      },
    }),
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
