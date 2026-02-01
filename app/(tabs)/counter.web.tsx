
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const STORAGE_KEY = 'start_date';

export default function CounterScreen() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [calculatedDates, setCalculatedDates] = useState<{
    threeMonths: Date;
    sixMonths: Date;
    daysRemaining: number;
    showNotification: boolean;
  } | null>(null);

  console.log('CounterScreen (Web): Component rendered');

  useEffect(() => {
    loadStartDate();
  }, []);

  useEffect(() => {
    if (startDate) {
      calculateDates(startDate);
    }
  }, [startDate]);

  const loadStartDate = () => {
    try {
      const savedDate = localStorage.getItem(STORAGE_KEY);
      if (savedDate) {
        const date = new Date(savedDate);
        console.log('Loaded saved date from localStorage:', date);
        setStartDate(date);
      }
    } catch (error) {
      console.log('Error loading date:', error);
    }
  };

  const saveStartDate = (date: Date) => {
    try {
      localStorage.setItem(STORAGE_KEY, date.toISOString());
      console.log('Saved date to localStorage:', date);
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

    const showNotification = daysRemaining <= 30 && daysRemaining > 0;

    console.log('Calculated dates - 3 months:', threeMonthsDate, '6 months:', sixMonthsDate, 'Days remaining:', daysRemaining);

    setCalculatedDates({
      threeMonths: threeMonthsDate,
      sixMonths: sixMonthsDate,
      daysRemaining,
      showNotification,
    });
  };

  const handleDateChange = (event: any) => {
    const dateString = event.target.value;
    if (dateString) {
      const date = new Date(dateString);
      console.log('User selected date:', date);
      setStartDate(date);
      saveStartDate(date);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleClearDate = () => {
    const confirmed = window.confirm('האם אתה בטוח שברצונך למחוק את התאריך?');
    if (confirmed) {
      console.log('Clearing saved date');
      setStartDate(null);
      setCalculatedDates(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const startDateDisplay = startDate ? formatDate(startDate) : 'לא נבחר';
  const threeMonthsDisplay = calculatedDates ? formatDate(calculatedDates.threeMonths) : '-';
  const sixMonthsDisplay = calculatedDates ? formatDate(calculatedDates.sixMonths) : '-';

  const today = new Date();
  const maxDate = formatDateForInput(today);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="calendar-today"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.title}>ספירת ימים - תקופת מלווה</Text>
          <Text style={styles.subtitle}>
            חישוב תקופת 6 חודשים לפי חודשים קלנדריים
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>תאריך התחלה</Text>
          <View style={styles.dateInputContainer}>
            <input
              type="date"
              value={startDate ? formatDateForInput(startDate) : ''}
              onChange={handleDateChange}
              max={maxDate}
              style={{
                width: '100%',
                padding: 16,
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                backgroundColor: colors.backgroundAlt,
                border: 'none',
                borderRadius: 12,
                fontFamily: 'system-ui',
              }}
            />
          </View>

          {startDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearDate}
            >
              <Text style={styles.clearButtonText}>מחק תאריך</Text>
            </TouchableOpacity>
          )}
        </View>

        {calculatedDates && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>3 חודשים ראשונים - מלווה</Text>
              <View style={styles.dateRow}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.dateText}>{threeMonthsDisplay}</Text>
              </View>
              <Text style={styles.description}>
                תקופת מלווה עם נהג מלווה
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>3 חודשים נוספים - מלווה לילה</Text>
              <View style={styles.dateRow}>
                <IconSymbol
                  ios_icon_name="moon.fill"
                  android_material_icon_name="nightlight"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.dateText}>{sixMonthsDisplay}</Text>
              </View>
              <Text style={styles.description}>
                תקופת מלווה לילה בלבד
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>זמן נותר</Text>
              <View style={styles.daysContainer}>
                <Text style={styles.daysNumber}>{calculatedDates.daysRemaining}</Text>
                <Text style={styles.daysLabel}>ימים</Text>
              </View>
            </View>

            {calculatedDates.showNotification && (
              <View style={[styles.card, styles.notificationCard]}>
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="warning"
                  size={32}
                  color={colors.warning}
                />
                <Text style={styles.notificationTitle}>תזכורת חשובה</Text>
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
              size={64}
              color={colors.grey}
            />
            <Text style={styles.emptyText}>
              בחר תאריך התחלה כדי לראות את החישוב
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(79, 195, 247, 0.15)',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'right',
  },
  dateInputContainer: {
    width: '100%',
  },
  clearButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  daysContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  daysNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  daysLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  notificationCard: {
    backgroundColor: '#FFF3E0',
    borderColor: colors.warning,
    borderWidth: 2,
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
