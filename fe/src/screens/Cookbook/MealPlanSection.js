import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import {
  useGetMealPlansQuery,
  useRemoveMealPlanMutation,
  useAddMealPlanMutation,
} from '@redux/api/MealPlans';
import { useGetRecipesQuery } from '@redux/api/Recipes';
import SectionHeader from '@components/GlobalUI/SectionHeader';
import { useNavigation } from '@react-navigation/native';

const MealPlanSection = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const formatDate = d => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // Get current week dates (Mon to Sun)
  const weekDates = useMemo(() => {
    const dates = [];
    const curr = new Date();
    // find Monday
    const first =
      curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);

    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      dates.push(d);
    }
    return dates;
  }, []);

  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  const { data: mealPlansData, isLoading } = useGetMealPlansQuery({
    startDate,
    endDate,
  });
  const [removeMealPlan] = useRemoveMealPlanMutation();
  const { data: recipesData } = useGetRecipesQuery();
  const [addMealPlan, { isLoading: isAdding }] = useAddMealPlanMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');

  const allRecipes = recipesData?.Data || [];
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allRecipes, searchQuery]);

  const mealPlans = mealPlansData?.Data || [];
  const selectedMeals = mealPlans.filter(m => m.date === selectedDate);

  const handleAddFromCookbook = async () => {
    if (!selectedRecipe) {
      Alert.alert(t('error_title'), 'Vui lòng chọn món ăn');
      return;
    }
    try {
      await addMealPlan({
        recipeId: selectedRecipe.id,
        date: selectedDate,
        mealType: selectedMealType,
      }).unwrap();
      setIsModalVisible(false);
      setSelectedRecipe(null);
      setSearchQuery('');
      Alert.alert(t('success_title'), 'Đã thêm vào kế hoạch ăn uống!');
    } catch (err) {
      Alert.alert(t('error_title'), 'Lỗi khi thêm vào kế hoạch');
    }
  };

  const mealTypes = [
    { type: 'Breakfast', icon: 'sunny', label: 'Bữa sáng' },
    { type: 'Lunch', icon: 'fast-food', label: 'Bữa trưa' },
    { type: 'Dinner', icon: 'restaurant', label: 'Bữa tối' },
    { type: 'Snack', icon: 'cafe', label: 'Ăn vặt' },
  ];

  const getMealIcon = type => {
    switch (type) {
      case 'Breakfast':
        return 'sunny';
      case 'Lunch':
        return 'fast-food';
      case 'Dinner':
        return 'restaurant';
      case 'Snack':
        return 'cafe';
      default:
        return 'nutrition';
    }
  };

  const translateMealType = type => {
    switch (type) {
      case 'Breakfast':
        return 'Sáng';
      case 'Lunch':
        return 'Trưa';
      case 'Dinner':
        return 'Tối';
      case 'Snack':
        return 'Ăn vặt';
      default:
        return type;
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title={'Kế hoạch nấu ăn'}
        onActionPress={() => setIsModalVisible(true)}
        actionText={'+ Thêm món'}
      />
      
      <View style={styles.actionBar}>
        <Text style={styles.weekLabel}>Thực đơn tuần này</Text>
        <TouchableOpacity 
          style={styles.smartCartButton}
          onPress={() => navigation.navigate('SmartShoppingList', { startDate, endDate })}
        >
          <Ionicons name="sparkles" size={13} color={Colors.white} />
          <Text style={styles.smartCartButtonText}>Đi chợ tuần</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateList}
      >
        {weekDates.map((date, index) => {
          const dateStr = formatDate(date);
          const isSelected = dateStr === selectedDate;
          const hasMeals = mealPlans.some(m => m.date === dateStr);
          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

          return (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => setSelectedDate(dateStr)}
            >
              <Text style={[styles.dayText, isSelected && styles.textSelected]}>
                {dayNames[date.getDay()]}
              </Text>
              <Text
                style={[styles.dateText, isSelected && styles.textSelected]}
              >
                {String(date.getDate()).padStart(2, '0')}
              </Text>
              {hasMeals && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
        {/* Extra padding right */}
        <View style={{ width: 20 }} />
      </ScrollView>

      <View style={styles.mealsContainer}>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : selectedMeals.length > 0 ? (
          selectedMeals.map(meal => (
            <TouchableOpacity 
              key={meal.id} 
              style={styles.mealItem}
              onPress={() => {
                if (meal.Recipe?.id) {
                  navigation.navigate('RecipeDetail', { recipeId: meal.Recipe.id });
                }
              }}
            >
              <View style={styles.mealIconContainer}>
                <Ionicons
                  name={getMealIcon(meal.mealType)}
                  size={20}
                  color={Colors.white}
                />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealType}>
                  {translateMealType(meal.mealType)}
                </Text>
                <Text style={styles.recipeName} numberOfLines={1}>
                  {meal.Recipe?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeMealPlan(meal.id)}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={Colors.danger || '#E74C3C'}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có kế hoạch cho ngày này</Text>
          </View>
        )}
      </View>
      <SectionHeader title={t('all_saved')} />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Thêm món vào ngày {selectedDate}
                  </Text>
                  <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Compact search bar */}
                <View style={styles.modalSearchContainer}>
                  <Ionicons name="search-outline" size={16} color="#888" />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Tìm kiếm món ăn..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>

                {filteredRecipes.length === 0 ? (
                  <View style={styles.emptySavedContainer}>
                    <Ionicons name="restaurant-outline" size={48} color="#ccc" />
                    <Text style={styles.emptySavedText}>
                      Không tìm thấy món ăn nào khớp với từ khóa tìm kiếm.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.sectionLabel}>
                      Chọn món ăn lên thực đơn:
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.recipeSelectorList}
                      contentContainerStyle={styles.recipeSelectorContent}
                    >
                      {filteredRecipes.map(recipe => {
                        const isSelected = selectedRecipe?.id === recipe.id;
                        const imgUrl = recipe.image_url || recipe.image;
                        return (
                          <TouchableOpacity
                            key={recipe.id}
                            style={[
                              styles.recipeSelectorCard,
                              isSelected && styles.recipeSelectorCardSelected,
                            ]}
                            onPress={() => setSelectedRecipe(recipe)}
                          >
                            <Image
                              source={{
                                uri: imgUrl?.replace(
                                  /\d+x\d+cq\d+/,
                                  '680x482cq70',
                                ),
                              }}
                              style={styles.recipeSelectorImage}
                            />
                            <Text
                              style={styles.recipeSelectorTitle}
                              numberOfLines={2}
                            >
                              {recipe.title}
                            </Text>
                            {isSelected && (
                              <View style={styles.checkmarkBadge}>
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color={Colors.primary}
                                />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    <Text style={styles.sectionLabel}>Chọn bữa ăn:</Text>
                    <View style={styles.mealGrid}>
                      {mealTypes.map(item => {
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
                              size={20}
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
                      onPress={handleAddFromCookbook}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <Text style={styles.confirmBtnText}>Xác nhận thêm</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  dateList: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  dateCard: {
    width: 60,
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
    fontSize: 14,
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
    position: 'absolute',
    bottom: 8,
  },
  mealsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.black,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 12,
    marginTop: 10,
  },
  recipeSelectorList: {
    marginBottom: 20,
  },
  recipeSelectorContent: {
    paddingRight: 20,
  },
  recipeSelectorCard: {
    width: 100,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    padding: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  recipeSelectorCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  recipeSelectorImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#EFEFEF',
  },
  recipeSelectorTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'center',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  mealCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  mealCardSelected: {
    backgroundColor: Colors.primary,
  },
  mealLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.black,
    marginLeft: 8,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
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
    fontSize: 15,
  },
  emptySavedContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySavedText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 20,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    marginLeft: 8,
    padding: 0,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  smartCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  smartCartButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});

export default MealPlanSection;
