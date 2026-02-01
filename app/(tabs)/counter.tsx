
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const STORAGE_KEY = 'start_date';

export default function CounterScreen() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
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
  } | null>(null);

  console.log('CounterScreen: Component rendered');

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
      if (Platform.OS === 'web') {
        const savedDate = localStorage.getItem(STORAGE_KEY);
        if (savedDate) {
          const date = new Date(savedDate);
          console.log('Loaded saved date from localStorage:', date);
          setStartDate(date);
        }
      } else {
        const savedDate = await SecureStore.getItemAsync(STORAGE_KEY);
        if (savedDate) {
          const date = new Date(savedDate);
          console.log('Loaded saved date from SecureStore:', date);
          setStartDate(date);
        }
      }
    } catch (error) {
      console.log('Error loading date:', error);
    }
  };

  const saveStartDate = async (date: Date) => {
    try {
      const dateString = date.toISOString();
      if (Platform.OS === 'web') {
        localStorage.setItem(STORAGE_KEY, dateString);
        console.log('Saved date to localStorage:', date);
      } else {
        await SecureStore.setItemAsync(STORAGE_KEY, dateString);
        console.log('Saved date to SecureStore:', date);
      }
    } catch (error) {
      console.log('Error saving date:', error);
    }
  };

  const calculateDates = (start: Date) => {
    const threeMonthsDate = new Date(start);
    threeMonthsDate.setMonth(threeMonthsDate.getMonth() + 3);

    const sixMonthsDate = new Date(start);
    sixMonthsDate.setMonth(sixMonthsDate.getMonth() + 6);

    const today = new Date();
    const timeDiff = sixMonthsDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const stage1TotalDays = Math.ceil((threeMonthsDate.getTime() - start.getTime()) / (1000 * 3600 * 24));
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
    }

    const showNotification = daysRemaining <= 30 && daysRemaining > 0;

    console.log('Calculated dates - Stage 1 remaining:', stage1Remaining, 'Stage 2 remaining:', stage2Remaining);

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
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      console.log('User selected date:', selectedDate);
      setStartDate(selectedDate);
      saveStartDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleClearDate = () => {
    console.log('User tapped clear date button');
    Alert.alert(
      'מחיקת תאריך',
      'האם אתה בטוח שברצונך למחוק את התאריך?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            console.log('Clearing saved date');
            setStartDate(null);
            setCalculatedDates(null);
            if (Platform.OS === 'web') {
              localStorage.removeItem(STORAGE_KEY);
            } else {
              await SecureStore.deleteItemAsync(STORAGE_KEY);
            }
          },
        },
      ]
    );
  };

  const startDateDisplay = startDate ? formatDate(startDate) : 'בחר תאריך';
  const threeMonthsDisplay = calculatedDates ? formatDate(calculatedDates.threeMonths) : '-';
  const sixMonthsDisplay = calculatedDates ? formatDate(calculatedDates.sixMonths) : '-';

  const stage1Progress = calculatedDates && calculatedDates.stage1Total > 0
    ? ((calculatedDates.stage1Total - calculatedDates.stage1Remaining) / calculatedDates.stage1Total) * 100
    : 0;

  const stage2Progress = calculatedDates && calculatedDates.stage2Total > 0
    ? ((calculatedDates.stage2Total - calculatedDates.stage2Remaining) / calculatedDates.stage2Total) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>ספירת ימים</Text>
          <Text style={styles.subtitle}>תקופת מלווה - 6 חודשים</Text>
        </View>

        <View style={styles.dateCard}>
          <View style={styles.dateCardHeader}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.dateCardTitle}>תאריך התחלה</Text>
          </View>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              console.log('User tapped select date button');
              setShowPicker(true);
            }}
          >
            <Text style={styles.dateButtonText}>{startDateDisplay}</Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="arrow-drop-down"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {startDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearDate}
            >
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.clearButtonText}>מחק תאריך</Text>
            </TouchableOpacity>
          )}
        </View>

        {calculatedDates && (
          <>
            <View style={styles.stagesContainer}>
              <View style={[
                styles.stageCard,
                calculatedDates.currentStage === 1 && styles.stageCardActive
              ]}>
                <View style={styles.stageHeader}>
                  <View style={styles.stageIconContainer}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={28}
                      color={calculatedDates.currentStage === 1 ? '#4FC3F7' : '#8E8E93'}
                    />
                  </View>
                  <View style={styles.stageTitleContainer}>
                    <Text style={styles.stageTitle}>שלב 1 - מלווה</Text>
                    <Text style={styles.stageSubtitle}>3 חודשים ראשונים</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${stage1Progress}%` }]} />
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
              </View>

              <View style={[
                styles.stageCard,
                calculatedDates.currentStage === 2 && styles.stageCardActive
              ]}>
                <View style={styles.stageHeader}>
                  <View style={styles.stageIconContainer}>
                    <IconSymbol
                      ios_icon_name="moon.fill"
                      android_material_icon_name="nightlight"
                      size={28}
                      color={calculatedDates.currentStage === 2 ? '#4FC3F7' : '#8E8E93'}
                    />
                  </View>
                  <View style={styles.stageTitleContainer}>
                    <Text style={styles.stageTitle}>שלב 2 - מלווה לילה</Text>
                    <Text style={styles.stageSubtitle}>3 חודשים נוספים</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${stage2Progress}%` }]} />
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
              </View>
            </View>

            {calculatedDates.showNotification && (
              <View style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <IconSymbol
                    ios_icon_name="exclamationmark.triangle.fill"
                    android_material_icon_name="warning"
                    size={28}
                    color="#FF9800"
                  />
                  <Text style={styles.notificationTitle}>תזכורת חשובה</Text>
                </View>
                <Text style={styles.notificationText}>
                  מומלץ לבצע הצהרת סיום מלווה בתנאי שבוצע בהתאם לחוק
                </Text>
              </View>
            )}

            {calculatedDates.currentStage === 'completed' && (
              <View style={styles.completedCard}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={48}
                  color="#4CAF50"
                />
                <Text style={styles.completedTitle}>תקופת המלווה הסתיימה!</Text>
                <Text style={styles.completedText}>
                  סיימת בהצלחה את תקופת המלווה של 6 חודשים
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
              בחר את תאריך תחילת תקופת המלווה כדי לראות את החישוב המפורט
            </Text>
          </View>
        )}
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
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
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  dateCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#4FC3F7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(79, 195, 247, 0.12)',
      },
    }),
  },
  dateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dateCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  dateButton: {
    flexDirection: 'row',
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
  },
  clearButton: {
    flexDirection: 'row',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  stageCardActive: {
    borderColor: '#4FC3F7',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#4FC3F7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 20px rgba(79, 195, 247, 0.25)',
      },
    }),
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
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
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  stageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
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
    backgroundColor: '#4FC3F7',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
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
  notificationCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF9800',
    marginBottom: 24,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  notificationText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
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
