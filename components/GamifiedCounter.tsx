
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import CircularProgress from '@/components/CircularProgress';

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
  console.log('GamifiedCounter: Rendering with stage', currentStage);

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

  const getNextStageInfo = () => {
    if (currentStage === 1) {
      return {
        title: 'שלב הבא',
        subtitle: 'מלווה לילה',
        days: stage2Total,
        icon: 'nightlight' as const,
      };
    }
    return null;
  };

  const currentProgress = getCurrentStageProgress();
  const currentRemaining = getCurrentStageRemaining();
  const nextStage = getNextStageInfo();

  const getCurrentStageTitle = () => {
    if (currentStage === 1) return 'מלווה';
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

  return (
    <View style={styles.container}>
      <View style={styles.mainCircleContainer}>
        <CircularProgress
          size={280}
          strokeWidth={20}
          progress={currentProgress}
          color={getCurrentStageColor()}
          backgroundColor="#E0E0E0"
        >
          <View style={styles.mainCircleContent}>
            <Text style={styles.endDateText}>{endDate}</Text>
            <Text style={styles.mainNumber}>{currentRemaining}</Text>
            <Text style={styles.mainLabel}>ימים נותרו</Text>
            <View style={styles.stageIndicator}>
              <Text style={styles.stageText}>{getCurrentStageTitle()}</Text>
            </View>
          </View>
        </CircularProgress>
      </View>

      <Text style={styles.motivationalText}>{getMotivationalText()}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <CircularProgress
            size={100}
            strokeWidth={8}
            progress={(totalDaysCompleted / (stage1Total + stage2Total)) * 100}
            color="#FF9800"
            backgroundColor="#FFE0B2"
          >
            <View style={styles.statContent}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color="#FF9800"
              />
              <Text style={styles.statNumber}>{totalDaysCompleted}</Text>
            </View>
          </CircularProgress>
          <Text style={styles.statLabel}>ימים הושלמו</Text>
        </View>

        {nextStage && (
          <View style={styles.statCard}>
            <CircularProgress
              size={100}
              strokeWidth={8}
              progress={0}
              color="#9C27B0"
              backgroundColor="#E1BEE7"
            >
              <View style={styles.statContent}>
                <IconSymbol
                  ios_icon_name="moon.fill"
                  android_material_icon_name={nextStage.icon}
                  size={24}
                  color="#9C27B0"
                />
                <Text style={styles.statNumber}>{nextStage.days}</Text>
              </View>
            </CircularProgress>
            <Text style={styles.statLabel}>{nextStage.title}</Text>
            <Text style={styles.statSubLabel}>{nextStage.subtitle}</Text>
          </View>
        )}

        {currentStage === 'completed' && (
          <View style={styles.statCard}>
            <CircularProgress
              size={100}
              strokeWidth={8}
              progress={100}
              color="#4CAF50"
              backgroundColor="#C8E6C9"
            >
              <View style={styles.statContent}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={32}
                  color="#4CAF50"
                />
              </View>
            </CircularProgress>
            <Text style={styles.statLabel}>הושלם!</Text>
          </View>
        )}
      </View>

      {currentStage !== 'completed' && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBackground}>
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
  motivationalText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  statCard: {
    alignItems: 'center',
    gap: 8,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
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
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4FC3F7',
    borderRadius: 6,
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
