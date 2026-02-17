
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import CustomDatePicker from '@/components/CustomDatePicker';
import GamifiedCounter from '@/components/GamifiedCounter';
import CircularProgress from '@/components/CircularProgress';

const STORAGE_KEY = 'start_date';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function CounterScreen() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [stage1Expanded, setStage1Expanded] = useState(true);
  const [stage2Expanded, setStage2Expanded] = useState(true);
  const [datePickerExpanded, setDatePickerExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'stages' | 'total'>('stages');
  const [calculatedDates, setCalculatedDates] = useState<{
    threeMonths: Date;
    sixMonths: Date;
    daysRemaining: number;
    stage1Remaining: number;
    stage2Remaining: number;
    stage1Total: number;
    stage2Total: number;
    currentStage: 1 | 2 | 'completed';
    showNotification: boolean;
    isToday: boolean;
  } | null>(null);

  console.log('CounterScreen (Android): Component rendered, viewMode:', viewMode);

  useEffect(() => {
    loadStartDate();
  }, []);

  useEffect(() => {
    if (startDate) {
      calculateDates(startDate);
    }
  }, [startDate]);

  const loadStartDate = async () => {
    try {
      const savedDate = await SecureStore.getItemAsync(STORAGE_KEY);
      if (savedDate) {
        const date = new Date(savedDate);
        console.log('Loaded saved date from SecureStore (Android):', date);
        setStartDate(date);
        setDatePickerExpanded(false);
      }
    } catch (error) {
      console.log('Error loading date (Android):', error);
    }
  };

  const saveStartDate = async (date: Date) => {
    try {
      const dateString = date.toISOString();
      await SecureStore.setItemAsync(STORAGE_KEY, dateString);
      console.log('Saved date to SecureStore (Android):', date);
    } catch (error) {
      console.log('Error saving date (Android):', error);
    }
  };

  const calculateDates = useCallback((start: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDateNormalized = new Date(start);
    startDateNormalized.setHours(0, 0, 0, 0);
    
    const isToday = startDateNormalized.getTime() === today.getTime();
    
    if (isToday) {
      console.log('Selected date is today - setting stages to 0% (Android)');
      const actualStartDate = new Date(start);
      actualStartDate.setDate(actualStartDate.getDate() + 1);

      const threeMonthsDate = new Date(actualStartDate);
      threeMonthsDate.setMonth(threeMonthsDate.getMonth() + 3);

      const sixMonthsDate = new Date(actualStartDate);
      sixMonthsDate.setMonth(sixMonthsDate.getMonth() + 6);

      const stage1TotalDays = Math.ceil((threeMonthsDate.getTime() - actualStartDate.getTime()) / (1000 * 3600 * 24));
      const stage2TotalDays = Math.ceil((sixMonthsDate.getTime() - threeMonthsDate.getTime()) / (1000 * 3600 * 24));

      setCalculatedDates({
        threeMonths: threeMonthsDate,
        sixMonths: sixMonthsDate,
        daysRemaining: stage1TotalDays + stage2TotalDays,
        stage1Remaining: stage1TotalDays,
        stage2Remaining: stage2TotalDays,
        stage1Total: stage1TotalDays,
        stage2Total: stage2TotalDays,
        currentStage: 1,
        showNotification: false,
        isToday: true,
      });
      return;
    }

    const actualStartDate = new Date(start);
    actualStartDate.setDate(actualStartDate.getDate() + 1);

    const threeMonthsDate = new Date(actualStartDate);
    threeMonthsDate.setMonth(threeMonthsDate.getMonth() + 3);

    const sixMonthsDate = new Date(actualStartDate);
    sixMonthsDate.setMonth(sixMonthsDate.getMonth() + 6);

    const timeDiff = sixMonthsDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const stage1TotalDays = Math.ceil((threeMonthsDate.getTime() - actualStartDate.getTime()) / (1000 * 3600 * 24));
    const stage2TotalDays = Math.ceil((sixMonthsDate.getTime() - threeMonthsDate.getTime()) / (1000 * 3600 * 24));

    let stage1Remaining = 0;
    let stage2Remaining = 0;
    let currentStage: 1 | 2 | 'completed' = 'completed';

    if (today < threeMonthsDate) {
      stage1Remaining = Math.ceil((threeMonthsDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      stage2Remaining = stage2TotalDays;
      currentStage = 1;
    } else if (today < sixMonthsDate) {
      stage1Remaining = 0;
      stage2Remaining = Math.ceil((sixMonthsDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      currentStage = 2;
      setStage1Expanded(false);
    } else {
      setStage1Expanded(false);
      setStage2Expanded(false);
    }

    const showNotification = daysRemaining <= 30 && daysRemaining > 0;

    console.log('Calculated dates (Android) - Stage 1 remaining:', stage1Remaining, 'Stage 2 remaining:', stage2Remaining);

    setCalculatedDates({
      threeMonths: threeMonthsDate,
      sixMonths: sixMonthsDate,
      daysRemaining,
      stage1Remaining,
      stage2Remaining,
      stage1Total: stage1TotalDays,
      stage2Total: stage2TotalDays,
      currentStage,
      showNotification,
      isToday: false,
    });
  }, []);

  const handleDateSelect = (date: Date) => {
    console.log('User selected date (Android):', date);
    setStartDate(date);
    saveStartDate(date);
    setDatePickerExpanded(false);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleClearDate = () => {
    console.log('User tapped clear date button (Android)');
    Alert.alert(
      'מחיקת תאריך',
      'האם אתה בטוח שברצונך למחוק את התאריך?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            console.log('Clearing saved date (Android)');
            setStartDate(null);
            setCalculatedDates(null);
            setDatePickerExpanded(true);
            await SecureStore.deleteItemAsync(STORAGE_KEY);
          },
        },
      ]
    );
  };

  const handleToggleView = () => {
    console.log('User toggled view mode (Android) from', viewMode, 'to', viewMode === 'stages' ? 'total' : 'stages');
    const newMode = viewMode === 'stages' ? 'total' : 'stages';
    setViewMode(newMode);
  };

  const startDateDisplay = startDate ? formatDate(startDate) : 'בחר תאריך';
  const threeMonthsDisplay = calculatedDates ? formatDate(calculatedDates.threeMonths) : '-';
  const sixMonthsDisplay = calculatedDates ? formatDate(calculatedDates.sixMonths) : '-';

  const stage1Progress = calculatedDates && calculatedDates.stage1Total > 0
    ? (calculatedDates.isToday ? 0 : ((calculatedDates.stage1Total - calculatedDates.stage1Remaining) / calculatedDates.stage1Total) * 100)
    : 0;

  const stage2Progress = calculatedDates && calculatedDates.stage2Total > 0
    ? (calculatedDates.isToday ? 0 : ((calculatedDates.stage2Total - calculatedDates.stage2Remaining) / calculatedDates.stage2Total) * 100)
    : 0;

  const isStage1Completed = calculatedDates && calculatedDates.stage1Remaining === 0 && calculatedDates.currentStage !== 1;
  const isStage2Completed = calculatedDates && calculatedDates.stage2Remaining === 0 && calculatedDates.currentStage === 'completed';

  const getTotalDaysCompleted = () => {
    if (!calculatedDates) return 0;
    const stage1Completed = calculatedDates.stage1Total - calculatedDates.stage1Remaining;
    const stage2Completed = calculatedDates.stage2Total - calculatedDates.stage2Remaining;
    return stage1Completed + stage2Completed;
  };

  const getTotalDaysRemaining = () => {
    if (!calculatedDates) return 0;
    return calculatedDates.stage1Remaining + calculatedDates.stage2Remaining;
  };

  const getTotalProgress = () => {
    if (!calculatedDates) return 0;
    const totalDays = calculatedDates.stage1Total + calculatedDates.stage2Total;
    const totalCompleted = getTotalDaysCompleted();
    return (totalCompleted / totalDays) * 100;
  };

  const getCurrentEndDate = () => {
    if (!calculatedDates) return '';
    if (calculatedDates.currentStage === 1) {
      return formatDate(calculatedDates.threeMonths);
    } else if (calculatedDates.currentStage === 2) {
      return formatDate(calculatedDates.sixMonths);
    }
    return formatDate(calculatedDates.sixMonths);
  };

  const datePickerTitle = 'תשלום אגרת היתר נהיגה';
  const stagesButtonText = 'לפי שלבי ליווי';
  const totalButtonText = 'סה"כ';
  const totalDaysRemaining = getTotalDaysRemaining();
  const totalProgress = getTotalProgress();
  const totalDaysRemainingText = String(totalDaysRemaining);
  const totalProgressPercentText = `${Math.round(totalProgress)}%`;
  const isFullyCompleted = calculatedDates && calculatedDates.currentStage === 'completed' && totalDaysRemaining === 0;
  const completionTitle = 'סיימת מלווה!';
  const completionSubtitle = 'תהנה עם הרישיון';
  const totalCircleColor = isFullyCompleted ? '#4CAF50' : '#4FC3F7';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>ספירת ימי מלווה</Text>
        </View>

        {datePickerExpanded ? (
          <View style={styles.dateCard}>
            <View style={styles.dateCardHeader}>
              <Text style={styles.dateCardTitle}>{datePickerTitle}</Text>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color={colors.primary}
              />
            </View>
            
            <View style={styles.infoBox}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={18}
                color="#4FC3F7"
              />
              <Text style={styles.infoText}>
                מדובר בתאריך בו שילמת את האגרה - לא בתאריך מעבר הטסט
              </Text>
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                console.log('User tapped select date button (Android)');
                setShowPicker(true);
              }}
            >
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={styles.dateButtonText}>{startDateDisplay}</Text>
            </TouchableOpacity>

            {startDate && (
              <>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearDate}
                >
                  <Text style={styles.clearButtonText}>מחק תאריך</Text>
                  <IconSymbol
                    ios_icon_name="trash"
                    android_material_icon_name="delete"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.collapseButton}
                  onPress={() => {
                    console.log('User tapped to collapse date picker (Android)');
                    setDatePickerExpanded(false);
                  }}
                >
                  <Text style={styles.collapseButtonText}>כווץ</Text>
                  <IconSymbol
                    ios_icon_name="chevron.up"
                    android_material_icon_name="expand-less"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.dateCardCollapsed}
            onPress={() => {
              console.log('User tapped to expand date picker (Android)');
              setDatePickerExpanded(true);
            }}
          >
            <View style={styles.collapsedContent}>
              <View style={styles.collapsedLeft}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <View style={styles.collapsedCenter}>
                <Text style={styles.collapsedTitle}>{datePickerTitle}</Text>
                <Text style={styles.collapsedDateValue}>{startDateDisplay}</Text>
              </View>
              <View style={styles.collapsedRight}>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="expand-more"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {calculatedDates && (
          <>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  viewMode === 'stages' && styles.toggleButtonActive,
                ]}
                onPress={handleToggleView}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    viewMode === 'stages' && styles.toggleButtonTextActive,
                  ]}
                >
                  {stagesButtonText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  viewMode === 'total' && styles.toggleButtonActive,
                ]}
                onPress={handleToggleView}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    viewMode === 'total' && styles.toggleButtonTextActive,
                  ]}
                >
                  {totalButtonText}
                </Text>
              </TouchableOpacity>
            </View>

            {viewMode === 'stages' ? (
              <>
                <GamifiedCounter
                  currentStage={calculatedDates.currentStage}
                  stage1Remaining={calculatedDates.stage1Remaining}
                  stage2Remaining={calculatedDates.stage2Remaining}
                  stage1Total={calculatedDates.stage1Total}
                  stage2Total={calculatedDates.stage2Total}
                  totalDaysCompleted={getTotalDaysCompleted()}
                  endDate={getCurrentEndDate()}
                />

                <View style={styles.stagesContainer}>
                  {isStage1Completed && !stage1Expanded ? (
                    <TouchableOpacity
                      style={styles.stageCardCollapsed}
                      onPress={() => {
                        console.log('User tapped to expand Stage 1 (Android)');
                        setStage1Expanded(true);
                      }}
                    >
                      <View style={styles.collapsedContent}>
                        <View style={styles.collapsedLeft}>
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check-circle"
                            size={28}
                            color="#4CAF50"
                          />
                        </View>
                        <View style={styles.collapsedCenter}>
                          <Text style={styles.collapsedTitle}>שלב 1 - מלווה</Text>
                          <Text style={styles.collapsedStatus}>הסתיים</Text>
                        </View>
                        <View style={styles.collapsedRight}>
                          <IconSymbol
                            ios_icon_name="chevron.down"
                            android_material_icon_name="expand-more"
                            size={24}
                            color={colors.textSecondary}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={[
                      styles.stageCard,
                      calculatedDates.currentStage === 1 && styles.stageCardActive,
                      isStage1Completed && styles.stageCardCompleted
                    ]}>
                      <View style={styles.stageHeader}>
                        <View style={styles.stageTitleContainer}>
                          <Text style={styles.stageTitle}>שלב 1 - מלווה</Text>
                          <Text style={styles.stageSubtitle}>3 חודשים ראשונים</Text>
                        </View>
                        <View style={styles.stageIconContainer}>
                          <IconSymbol
                            ios_icon_name="person.fill"
                            android_material_icon_name="person"
                            size={28}
                            color={calculatedDates.currentStage === 1 ? '#4FC3F7' : isStage1Completed ? '#4CAF50' : '#8E8E93'}
                          />
                        </View>
                      </View>

                      <View style={styles.requirementBox}>
                        <Text style={styles.requirementText}>חובת ליווי 24/7</Text>
                      </View>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${stage1Progress}%`, backgroundColor: isStage1Completed ? '#4CAF50' : '#4FC3F7' }]} />
                        </View>
                        <Text style={styles.progressText}>
                          {Math.round(stage1Progress)}%
                        </Text>
                      </View>

                      <View style={styles.stageDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>ימים שנותרו</Text>
                          <Text style={styles.detailValue}>{calculatedDates.stage1Remaining}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>תאריך סיום</Text>
                          <Text style={styles.detailValue}>{threeMonthsDisplay}</Text>
                        </View>
                      </View>

                      {calculatedDates.currentStage === 1 && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>שלב נוכחי</Text>
                        </View>
                      )}

                      {isStage1Completed && (
                        <TouchableOpacity
                          style={styles.collapseButton}
                          onPress={() => {
                            console.log('User tapped to collapse Stage 1 (Android)');
                            setStage1Expanded(false);
                          }}
                        >
                          <Text style={styles.collapseButtonText}>כווץ</Text>
                          <IconSymbol
                            ios_icon_name="chevron.up"
                            android_material_icon_name="expand-less"
                            size={18}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {isStage2Completed && !stage2Expanded ? (
                    <TouchableOpacity
                      style={styles.stageCardCollapsed}
                      onPress={() => {
                        console.log('User tapped to expand Stage 2 (Android)');
                        setStage2Expanded(true);
                      }}
                    >
                      <View style={styles.collapsedContent}>
                        <View style={styles.collapsedLeft}>
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check-circle"
                            size={28}
                            color="#4CAF50"
                          />
                        </View>
                        <View style={styles.collapsedCenter}>
                          <Text style={styles.collapsedTitle}>שלב 2 - מלווה לילה</Text>
                          <Text style={styles.collapsedStatus}>הסתיים</Text>
                        </View>
                        <View style={styles.collapsedRight}>
                          <IconSymbol
                            ios_icon_name="chevron.down"
                            android_material_icon_name="expand-more"
                            size={24}
                            color={colors.textSecondary}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={[
                      styles.stageCard,
                      calculatedDates.currentStage === 2 && styles.stageCardActive,
                      isStage2Completed && styles.stageCardCompleted
                    ]}>
                      <View style={styles.stageHeader}>
                        <View style={styles.stageTitleContainer}>
                          <Text style={styles.stageTitle}>שלב 2 - מלווה לילה</Text>
                          <Text style={styles.stageSubtitle}>3 חודשים נוספים</Text>
                        </View>
                        <View style={styles.stageIconContainer}>
                          <IconSymbol
                            ios_icon_name="moon.fill"
                            android_material_icon_name="nightlight"
                            size={28}
                            color={calculatedDates.currentStage === 2 ? '#4FC3F7' : isStage2Completed ? '#4CAF50' : '#8E8E93'}
                          />
                        </View>
                      </View>

                      <View style={styles.requirementBox}>
                        <Text style={styles.requirementText}>חובת ליווי בין 21:00 ל-6:00 בלבד.</Text>
                      </View>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${stage2Progress}%`, backgroundColor: isStage2Completed ? '#4CAF50' : '#4FC3F7' }]} />
                        </View>
                        <Text style={styles.progressText}>
                          {Math.round(stage2Progress)}%
                        </Text>
                      </View>

                      <View style={styles.stageDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>ימים שנותרו</Text>
                          <Text style={styles.detailValue}>{calculatedDates.stage2Remaining}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>תאריך סיום</Text>
                          <Text style={styles.detailValue}>{sixMonthsDisplay}</Text>
                        </View>
                      </View>

                      {calculatedDates.currentStage === 2 && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>שלב נוכחי</Text>
                        </View>
                      )}

                      {isStage2Completed && (
                        <TouchableOpacity
                          style={styles.collapseButton}
                          onPress={() => {
                            console.log('User tapped to collapse Stage 2 (Android)');
                            setStage2Expanded(false);
                          }}
                        >
                          <Text style={styles.collapseButtonText}>כווץ</Text>
                          <IconSymbol
                            ios_icon_name="chevron.up"
                            android_material_icon_name="expand-less"
                            size={18}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.totalViewContainer}>
                <View style={styles.totalCircleContainer}>
                  <CircularProgress
                    size={280}
                    strokeWidth={20}
                    progress={totalProgress}
                    color={totalCircleColor}
                    backgroundColor="#E0E0E0"
                  >
                    <View style={styles.totalCircleContent}>
                      {isFullyCompleted ? (
                        <View style={styles.completionContainer}>
                          <Text style={styles.completionTitle}>{completionTitle}</Text>
                          <Text style={styles.completionSubtitle}>{completionSubtitle}</Text>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.totalEndDateText}>{sixMonthsDisplay}</Text>
                          <Text style={styles.totalMainNumber}>{totalDaysRemainingText}</Text>
                          <Text style={styles.totalMainLabel}>ימים נותרו</Text>
                        </>
                      )}
                    </View>
                  </CircularProgress>
                </View>

                <Text style={styles.totalMotivationalText}>
                  {isFullyCompleted 
                    ? 'שמחים שעזרנו לך לעבור טסט - הילוך מאה'
                    : `${Math.round(totalProgress)}% מהליך הליווי הכולל הושלם`}
                </Text>

                <View style={[
                  styles.totalCard,
                  isFullyCompleted && styles.totalCardCompleted
                ]}>
                  {isFullyCompleted && (
                    <View style={styles.completedCheckmarkContainer}>
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={48}
                        color="#4CAF50"
                      />
                    </View>
                  )}

                  <View style={styles.totalHeader}>
                    <View style={styles.totalTitleContainer}>
                      <Text style={styles.totalTitle}>סה"כ תקופת מלווה</Text>
                      <Text style={styles.totalSubtitle}>6 חודשים</Text>
                    </View>
                    <View style={styles.totalIconContainer}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="calendar-today"
                        size={32}
                        color={isFullyCompleted ? '#4CAF50' : '#4FC3F7'}
                      />
                    </View>
                  </View>

                  <View style={styles.totalStatsRow}>
                    <View style={styles.totalStatBox}>
                      <Text style={[
                        styles.totalStatValue,
                        isFullyCompleted && styles.totalStatValueCompleted
                      ]}>
                        {getTotalDaysRemaining()}
                      </Text>
                      <Text style={styles.totalStatLabel}>ימים נותרו</Text>
                    </View>
                    <View style={styles.totalStatDivider} />
                    <View style={styles.totalStatBox}>
                      <Text style={[
                        styles.totalStatValue,
                        isFullyCompleted && styles.totalStatValueCompleted
                      ]}>
                        {getTotalDaysCompleted()}
                      </Text>
                      <Text style={styles.totalStatLabel}>ימים הושלמו</Text>
                    </View>
                  </View>

                  <View style={styles.totalProgressContainer}>
                    <View style={styles.totalProgressBar}>
                      <View style={[
                        styles.totalProgressFill,
                        { 
                          width: `${getTotalProgress()}%`,
                          backgroundColor: isFullyCompleted ? '#4CAF50' : '#4FC3F7'
                        }
                      ]} />
                    </View>
                    <Text style={styles.totalProgressText}>
                      {totalProgressPercentText}
                    </Text>
                  </View>

                  <View style={styles.totalDetails}>
                    <View style={styles.totalDetailRow}>
                      <Text style={styles.totalDetailLabel}>תאריך התחלה</Text>
                      <Text style={styles.totalDetailValue}>{startDateDisplay}</Text>
                    </View>
                    <View style={styles.totalDetailRow}>
                      <Text style={styles.totalDetailLabel}>תאריך סיום</Text>
                      <Text style={styles.totalDetailValue}>{sixMonthsDisplay}</Text>
                    </View>
                    <View style={styles.totalDetailRow}>
                      <Text style={styles.totalDetailLabel}>סה"כ ימים</Text>
                      <Text style={styles.totalDetailValue}>{calculatedDates.stage1Total + calculatedDates.stage2Total}</Text>
                    </View>
                  </View>

                  {!isFullyCompleted && calculatedDates.currentStage !== 'completed' && (
                    <View style={styles.totalInfoBox}>
                      <IconSymbol
                        ios_icon_name="info.circle.fill"
                        android_material_icon_name="info"
                        size={20}
                        color="#4FC3F7"
                      />
                      <Text style={styles.totalInfoText}>
                        {calculatedDates.currentStage === 1 
                          ? 'כרגע בשלב 1 - מלווה 24/7'
                          : 'כרגע בשלב 2 - מלווה לילה בלבד'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {calculatedDates.showNotification && (
              <View style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>תזכורת חשובה</Text>
                  <IconSymbol
                    ios_icon_name="exclamationmark.triangle.fill"
                    android_material_icon_name="warning"
                    size={28}
                    color="#FF9800"
                  />
                </View>
                <Text style={styles.notificationText}>
                  מומלץ לבצע הצהרת סיום מלווה בתנאי שבוצע בהתאם לחוק
                </Text>
              </View>
            )}
          </>
        )}

        {!startDate && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="calendar.badge.plus"
              android_material_icon_name="event"
              size={72}
              color="#B3E5FC"
            />
            <Text style={styles.emptyTitle}>בחר תאריך התחלה</Text>
            <Text style={styles.emptyText}>
              בחר את תאריך תשלום אגרת היתר נהיגה כדי לראות את החישוב המפורט
            </Text>
          </View>
        )}
      </ScrollView>

      <CustomDatePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectDate={handleDateSelect}
        selectedDate={startDate}
        maximumDate={new Date()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4FC3F7',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  totalViewContainer: {
    marginBottom: 24,
  },
  totalCircleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    elevation: 10,
  },
  totalCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalEndDateText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  totalMainNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 80,
  },
  totalMainLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
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
  },
  totalMotivationalText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  totalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#4FC3F7',
    elevation: 6,
  },
  totalCardCompleted: {
    borderColor: '#4CAF50',
    elevation: 6,
  },
  completedCheckmarkContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  totalTitleContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right',
  },
  totalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'right',
  },
  totalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalStatsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  totalStatValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#4FC3F7',
    textAlign: 'center',
  },
  totalStatValueCompleted: {
    color: '#4CAF50',
  },
  totalStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  totalProgressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  totalProgressBar: {
    flex: 1,
    height: 14,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 7,
    overflow: 'hidden',
  },
  totalProgressFill: {
    height: '100%',
    borderRadius: 7,
  },
  totalProgressText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    minWidth: 55,
    textAlign: 'right',
  },
  totalDetails: {
    gap: 12,
    marginBottom: 16,
  },
  totalDetailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalDetailLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  totalDetailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  totalInfoBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
  },
  totalInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 20,
  },
  dateCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 4,
  },
  dateCardCollapsed: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  dateCardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dateCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 18,
  },
  dateButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundAlt,
    padding: 18,
    borderRadius: 14,
  },
  dateButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  clearButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    padding: 10,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stagesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  stageCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 3,
  },
  stageCardActive: {
    borderColor: '#4FC3F7',
    borderWidth: 2,
    elevation: 6,
  },
  stageCardCompleted: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    elevation: 5,
  },
  stageCardCollapsed: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    elevation: 3,
  },
  collapsedContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  collapsedLeft: {
    width: 40,
    alignItems: 'center',
  },
  collapsedCenter: {
    flex: 1,
    alignItems: 'flex-end',
  },
  collapsedRight: {
    width: 30,
    alignItems: 'center',
  },
  collapsedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  collapsedStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'right',
    marginTop: 2,
  },
  collapsedDateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  stageHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  stageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTitleContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  stageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'right',
  },
  requirementBox: {
    backgroundColor: '#FFF9E6',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    textAlign: 'right',
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 45,
    textAlign: 'right',
  },
  stageDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  currentBadge: {
    marginTop: 14,
    backgroundColor: '#4FC3F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  currentBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  collapseButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    gap: 6,
  },
  collapseButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF9800',
    marginBottom: 24,
  },
  notificationHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  notificationText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});
