
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  I18nManager,
  TextInput,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import CustomDatePicker from '@/components/CustomDatePicker';

const STORAGE_KEY = 'driving_expenses';

// Expense types in Hebrew
const EXPENSE_TYPES = [
  'שיעור נהיגה',
  'אגרת טסט',
  'אגרת מבחן תיאוריה',
  'תשלום למורה עבור טסט',
  'אגרת רישום',
  'שיעור נהיגה כפול',
  'אגרה לאחר מעבר טסט',
  'אגרת טסט פנימי',
];

interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
}

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  
  // Form state
  const [selectedType, setSelectedType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Load expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      console.log('Loading expenses from storage');
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpenses(parsed);
        console.log('Loaded expenses:', parsed.length);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      console.log('Saving expenses to storage:', newExpenses.length);
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const handleAddExpense = useCallback(() => {
    console.log('User tapped Add Expense button');
    setSelectedType('');
    setAmount('');
    setSelectedDate(new Date());
    setShowAddModal(true);
  }, []);

  const handleSelectType = useCallback((type: string) => {
    console.log('User selected expense type:', type);
    setSelectedType(type);
    setShowTypeModal(false);
  }, []);

  const handleSaveExpense = useCallback(() => {
    if (!selectedType || !amount) {
      console.log('Cannot save expense: missing type or amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.log('Cannot save expense: invalid amount');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      type: selectedType,
      amount: numAmount,
      date: selectedDate.toISOString(),
    };

    console.log('Saving new expense:', newExpense);
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    setShowAddModal(false);
  }, [selectedType, amount, selectedDate, expenses]);

  const handleDeleteExpense = useCallback((id: string) => {
    console.log('User tapped delete for expense:', id);
    setSelectedExpenseId(id);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!selectedExpenseId) return;
    
    console.log('Deleting expense:', selectedExpenseId);
    const updatedExpenses = expenses.filter(e => e.id !== selectedExpenseId);
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    setShowDeleteModal(false);
    setSelectedExpenseId(null);
  }, [selectedExpenseId, expenses]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatAmount = (amount: number): string => {
    return `₪${amount.toFixed(2)}`;
  };

  const getTotalAmount = (): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const totalAmount = getTotalAmount();
  const totalAmountText = formatAmount(totalAmount);

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>מעקב הוצאות</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddExpense}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>סך הכל הוצאות</Text>
        <Text style={styles.summaryAmount}>{totalAmountText}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="receipt"
              android_material_icon_name="receipt"
              size={64}
              color={colors.grey}
            />
            <Text style={styles.emptyText}>אין הוצאות עדיין</Text>
            <Text style={styles.emptySubtext}>לחץ על + להוספת הוצאה</Text>
          </View>
        ) : (
          <React.Fragment>
            {sortedExpenses.map((expense, index) => {
              const expenseDate = formatDate(expense.date);
              const expenseAmount = formatAmount(expense.amount);
              
              return (
                <View key={index} style={styles.expenseCard}>
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseType}>{expense.type}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteExpense(expense.id)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={20}
                        color={colors.warning}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.expenseDetails}>
                    <View style={styles.expenseDetailRow}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="calendar-today"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.expenseDate}>{expenseDate}</Text>
                    </View>
                    <Text style={styles.expenseAmount}>{expenseAmount}</Text>
                  </View>
                </View>
              );
            })}
          </React.Fragment>
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>הוספת הוצאה</Text>

            {/* Type Selection */}
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowTypeModal(true)}
              activeOpacity={0.7}
            >
              <Text style={selectedType ? styles.inputButtonTextSelected : styles.inputButtonText}>
                {selectedType || 'בחר סוג הוצאה'}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Amount Input */}
            <View style={styles.amountInputContainer}>
              <Text style={styles.inputLabel}>סכום</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>₪</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Date Selection */}
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.inputButtonTextSelected}>
                {formatDate(selectedDate.toISOString())}
              </Text>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveExpense}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.typeModalContent}>
            <Text style={styles.modalTitle}>בחר סוג הוצאה</Text>
            <ScrollView style={styles.typeList}>
              {EXPENSE_TYPES.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.typeItem}
                  onPress={() => handleSelectType(type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowTypeModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        selectedDate={selectedDate}
        maximumDate={new Date()}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.modalTitle}>מחיקת הוצאה</Text>
            <Text style={styles.deleteModalText}>האם אתה בטוח שברצונך למחוק הוצאה זו?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>מחק</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(79, 195, 247, 0.3)',
    elevation: 4,
  },
  summaryCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(79, 195, 247, 0.2)',
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(79, 195, 247, 0.15)',
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  inputButtonTextSelected: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundAlt,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: colors.warning,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeModalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  typeList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  typeItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  typeItemText: {
    fontSize: 16,
    color: colors.text,
  },
  deleteModalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  deleteModalText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
});
