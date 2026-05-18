import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';

const MealPlanModal = ({ visible, onClose, onSubmit, isLoading, recipeTitle }) => {
  const { t } = useTranslation();

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Generate next 7 days starting from today
  const availableDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');

  const mealTypes = [
    { type: 'Breakfast', icon: 'sunny', label: t('breakfast', 'Bữa sáng') },
    { type: 'Lunch', icon: 'fast-food', label: t('lunch', 'Bữa trưa') },
    { type: 'Dinner', icon: 'restaurant', label: t('dinner', 'Bữa tối') },
    { type: 'Snack', icon: 'cafe', label: t('snack', 'Ăn vặt') },
  ];

  const handleConfirm = () => {
    onSubmit({ date: selectedDate, mealType: selectedMealType });
  };

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getDayLabel = (date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (formatDate(date) === formatDate(today)) {
      return t('today', 'Hôm nay');
    }
    if (formatDate(date) === formatDate(tomorrow)) {
      return t('tomorrow', 'Ngày mai');
    }
    return dayNames[date.getDay()];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('add_to_meal_plan_title', 'Lên kế hoạch nấu ăn')}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {recipeTitle && (
                <Text style={styles.recipeTitle} numberOfLines={1}>
                  {recipeTitle}
                </Text>
              )}

              <Text style={styles.sectionLabel}>{t('select_date', 'Chọn ngày nấu')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateList}
                contentContainerStyle={styles.dateListContent}
              >
                {availableDates.map((date, index) => {
                  const dateStr = formatDate(date);
                  const isSelected = dateStr === selectedDate;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateCard,
                        isSelected && styles.dateCardSelected,
                      ]}
                      onPress={() => setSelectedDate(dateStr)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.textSelected,
                        ]}
                      >
                        {getDayLabel(date)}
                      </Text>
                      <Text
                        style={[
                          styles.dateText,
                          isSelected && styles.textSelected,
                        ]}
                      >
                        {String(date.getDate()).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.sectionLabel}>{t('select_meal_type', 'Chọn bữa ăn')}</Text>
              <View style={styles.mealGrid}>
                {mealTypes.map((item) => {
                  const isSelected = item.type === selectedMealType;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.mealCard,
                        isSelected && styles.mealCardSelected,
                      ]}
                      onPress={() => setSelectedMealType(item.type)}
                    >
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={isSelected ? Colors.white : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.mealLabel,
                          isSelected && styles.textSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    {t('confirm', 'Thêm vào kế hoạch')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeBtn: {
    padding: 5,
  },
  recipeTitle: {
    fontSize: 16,
    color: Colors.textLight || '#888',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  dateList: {
    marginBottom: 20,
  },
  dateListContent: {
    paddingRight: 20,
  },
  dateCard: {
    width: 65,
    height: 80,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  textSelected: {
    color: Colors.white,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  mealCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 12,
  },
  mealCardSelected: {
    backgroundColor: Colors.primary,
  },
  mealLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 10,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MealPlanModal;
