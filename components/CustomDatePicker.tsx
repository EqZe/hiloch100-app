
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
  maximumDate?: Date;
}

export default function CustomDatePicker({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  maximumDate = new Date(),
}: CustomDatePickerProps) {
  const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());

  const currentYear = maximumDate.getFullYear();
  const currentMonth = maximumDate.getMonth();
  const currentDay = maximumDate.getDate();

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(tempDate.getFullYear(), tempDate.getMonth());
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleYearChange = (year: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(year);
    
    if (newDate > maximumDate) {
      newDate.setMonth(currentMonth);
      newDate.setDate(Math.min(tempDate.getDate(), getDaysInMonth(year, currentMonth)));
    }
    
    setTempDate(newDate);
  };

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(monthIndex);
    
    if (newDate > maximumDate) {
      newDate.setDate(Math.min(tempDate.getDate(), getDaysInMonth(tempDate.getFullYear(), monthIndex)));
    }
    
    setTempDate(newDate);
  };

  const handleDayChange = (day: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(day);
    
    if (newDate <= maximumDate) {
      setTempDate(newDate);
    }
  };

  const handleConfirm = () => {
    console.log('User confirmed date selection:', tempDate);
    onSelectDate(tempDate);
    onClose();
  };

  const handleCancel = () => {
    console.log('User cancelled date selection');
    setTempDate(selectedDate || new Date());
    onClose();
  };

  const isDateDisabled = (year: number, month: number, day: number) => {
    const testDate = new Date(year, month, day);
    return testDate > maximumDate;
  };

  const selectedYear = tempDate.getFullYear();
  const selectedMonth = tempDate.getMonth();
  const selectedDay = tempDate.getDate();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>בחר תאריך</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>שנה</Text>
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {years.map((year) => {
                  const isSelected = year === selectedYear;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                      onPress={() => handleYearChange(year)}
                    >
                      <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>חודש</Text>
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {months.map((month, index) => {
                  const isSelected = index === selectedMonth;
                  const isDisabled = selectedYear === currentYear && index > currentMonth;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerItem,
                        isSelected && styles.pickerItemSelected,
                        isDisabled && styles.pickerItemDisabled,
                      ]}
                      onPress={() => !isDisabled && handleMonthChange(index)}
                      disabled={isDisabled}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          isSelected && styles.pickerItemTextSelected,
                          isDisabled && styles.pickerItemTextDisabled,
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>יום</Text>
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {days.map((day) => {
                  const isSelected = day === selectedDay;
                  const isDisabled = isDateDisabled(selectedYear, selectedMonth, day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        isSelected && styles.pickerItemSelected,
                        isDisabled && styles.pickerItemDisabled,
                      ]}
                      onPress={() => !isDisabled && handleDayChange(day)}
                      disabled={isDisabled}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          isSelected && styles.pickerItemTextSelected,
                          isDisabled && styles.pickerItemTextDisabled,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>אישור</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  closeButton: {
    padding: 4,
  },
  pickerContainer: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginBottom: 24,
  },
  pickerColumn: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  scrollView: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primary,
  },
  pickerItemDisabled: {
    opacity: 0.3,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  pickerItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pickerItemTextDisabled: {
    color: colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
