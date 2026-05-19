import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import {
  useGetNutritionProfileQuery,
  useSetupNutritionMutation,
  useGetNutritionPlanQuery
} from '@redux/api/Recipes';
import { useAddMealPlanMutation } from '@redux/api/MealPlans';
import styles from './styles';

const NutritionPlannerScreen = ({ navigation }) => {
  const { data: profileRes, isLoading: loadingProfile, refetch: refetchProfile } = useGetNutritionProfileQuery();
  const { data: planRes, isLoading: loadingPlan, refetch: refetchPlan } = useGetNutritionPlanQuery();
  const [setupNutrition, { isLoading: isSettingUp }] = useSetupNutritionMutation();
  const [addMealPlan, { isLoading: isAddingMeal }] = useAddMealPlanMutation();

  const profile = profileRes?.Data;
  const plan = planRes?.Data;

  // View states
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('breakfast'); // 'breakfast' | 'lunch' | 'dinner'

  // Form states
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male'); // 'male' | 'female'
  const [activityLevel, setActivityLevel] = useState('sedentary'); // 'sedentary' | 'light' | 'moderate' | 'active'
  const [goal, setGoal] = useState('maintain'); // 'lose_weight' | 'maintain' | 'gain_weight'

  // Modal for scheduling
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);

  const startEditing = () => {
    if (profile) {
      setWeight(String(profile.weight));
      setHeight(String(profile.height));
      setAge(String(profile.age));
      setGender(profile.gender);
      setActivityLevel(profile.activityLevel);
      setGoal(profile.goal);
    }
    setIsEditing(true);
  };

  const handleSetup = async () => {
    if (!weight || !height || !age) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ Cân nặng, Chiều cao và Tuổi của bạn.');
      return;
    }

    try {
      await setupNutrition({
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender,
        activityLevel,
        goal
      }).unwrap();

      Alert.alert('Thành công', 'Đã cập nhật chỉ số dinh dưỡng của bạn!');
      setIsEditing(false);
      refetchProfile();
      refetchPlan();
    } catch (err) {
      Alert.alert('Lỗi', err.data?.Message || 'Thiết lập kế hoạch thất bại.');
    }
  };

  const handleAddToPlan = async (mealType) => {
    if (!selectedRecipe) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await addMealPlan({
        date: today,
        recipeId: selectedRecipe.id,
        mealType: mealType // 'breakfast', 'lunch', 'dinner'
      }).unwrap();

      Alert.alert('Thành công', `Đã thêm món ăn vào Thực đơn ${getMealNameVi(mealType)} ngày hôm nay!`);
      setIsScheduleModalVisible(false);
      setSelectedRecipe(null);
    } catch (err) {
      Alert.alert('Lỗi', 'Thêm vào thực đơn thất bại. Vui lòng thử lại sau.');
    }
  };

  const getMealNameVi = (type) => {
    if (type === 'breakfast') return 'Sáng';
    if (type === 'lunch') return 'Trưa';
    return 'Tối';
  };

  const getActivityLabel = (level) => {
    switch (level) {
      case 'light': return 'Vận động nhẹ';
      case 'moderate': return 'Vận động vừa';
      case 'active': return 'Vận động nặng';
      case 'sedentary':
      default:
        return 'Ít vận động';
    }
  };

  const getGoalLabel = (g) => {
    switch (g) {
      case 'lose_weight': return 'Giảm cân 📉';
      case 'gain_weight': return 'Tăng cơ bắp 📈';
      case 'maintain':
      default:
        return 'Giữ cân & Dáng đẹp ⚖️';
    }
  };

  if (loadingProfile || loadingPlan) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // RENDER SETUP FORM
  if (!profile || isEditing) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            if (profile) setIsEditing(false);
            else navigation.goBack();
          }}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thiết Lập Dinh Dưỡng</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.formIntro}>
            Hãy cung cấp chỉ số cơ thể để Chef AI tính toán lượng Calo và các dưỡng chất thiết yếu hàng ngày dành riêng cho bạn.
          </Text>

          {/* Gender */}
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.genderCard, gender === 'male' && styles.activeCard]}
              onPress={() => setGender('male')}
            >
              <Ionicons name="male" size={24} color={gender === 'male' ? Colors.primary : Colors.border} />
              <Text style={[styles.cardText, gender === 'male' && styles.activeCardText]}>Nam ♂</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.genderCard, gender === 'female' && styles.activeCard]}
              onPress={() => setGender('female')}
            >
              <Ionicons name="female" size={24} color={gender === 'female' ? Colors.primary : Colors.border} />
              <Text style={[styles.cardText, gender === 'female' && styles.activeCardText]}>Nữ ♀</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Inputs */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Cân nặng (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Ví dụ: 65"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Chiều cao (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="Ví dụ: 170"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tuổi của bạn</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Ví dụ: 25"
            />
          </View>

          {/* Activity Level */}
          <Text style={styles.label}>Mức độ vận động</Text>
          {[
            { key: 'sedentary', title: 'Ít vận động 🛋️', desc: 'Làm việc văn phòng, ít đi lại, không tập thể thao' },
            { key: 'light', title: 'Vận động nhẹ 🚶', desc: 'Tập thể dục nhẹ nhàng 1 - 3 lần mỗi tuần' },
            { key: 'moderate', title: 'Vận động vừa 🏃', desc: 'Tập luyện tích cực từ 3 - 5 ngày mỗi tuần' },
            { key: 'active', title: 'Vận động nặng 🏋️', desc: 'Tập luyện cường độ cao 6 - 7 ngày mỗi tuần' }
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={[styles.optionCard, activityLevel === item.key && styles.activeCard]}
              onPress={() => setActivityLevel(item.key)}
            >
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, activityLevel === item.key && styles.activeCardText]}>{item.title}</Text>
                <Text style={styles.optionDesc}>{item.desc}</Text>
              </View>
              {activityLevel === item.key && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
            </TouchableOpacity>
          ))}

          {/* Goals */}
          <Text style={styles.label}>Mục tiêu sức khỏe</Text>
          {[
            { key: 'lose_weight', title: 'Giảm cân lành mạnh 📉', desc: 'Đốt cháy mỡ thừa và thon gọn vóc dáng' },
            { key: 'maintain', title: 'Giữ dáng & Cân bằng ⚖️', desc: 'Duy trì vóc dáng săn chắc và năng lượng dồi dào' },
            { key: 'gain_weight', title: 'Tăng cơ phát triển lực 📈', desc: 'Tập trung xây dựng cơ bắp khỏe mạnh' }
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={[styles.optionCard, goal === item.key && styles.activeCard]}
              onPress={() => setGoal(item.key)}
            >
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, goal === item.key && styles.activeCardText]}>{item.title}</Text>
                <Text style={styles.optionDesc}>{item.desc}</Text>
              </View>
              {goal === item.key && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSetup} disabled={isSettingUp}>
            {isSettingUp ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Tạo Kế Hoạch Ngay 🚀</Text>}
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  }

  // RENDER INTERACTIVE DASHBOARD
  const targetCalories = profile.targetCalories;
  const targetProtein = profile.targetProtein;
  const targetCarbs = profile.targetCarbs;
  const targetFat = profile.targetFat;

  const currentMealList = plan?.meals?.[activeTab] || [];
  const currentMealTarget = plan?.targets?.[activeTab] || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ Sơ Dinh Dưỡng</Text>
        <TouchableOpacity style={styles.editStatsButton} onPress={startEditing}>
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Glassmorphic Profile Stats */}
        <View style={styles.profileSummaryCard}>
          <View style={styles.statsRowSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Chiều cao</Text>
              <Text style={styles.summaryValue}>{profile.height} <Text style={styles.unit}>cm</Text></Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Cân nặng</Text>
              <Text style={styles.summaryValue}>{profile.weight} <Text style={styles.unit}>kg</Text></Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Độ tuổi</Text>
              <Text style={styles.summaryValue}>{profile.age} <Text style={styles.unit}>tuổi</Text></Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="bicycle-outline" size={14} color="#555" />
              <Text style={styles.badgeText}>{getActivityLabel(profile.activityLevel)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#eefcf8' }]}>
              <Text style={[styles.badgeText, { color: Colors.primary, fontWeight: '700' }]}>{getGoalLabel(profile.goal)}</Text>
            </View>
          </View>
        </View>

        {/* Calories Ring / Big Number Card */}
        <View style={styles.caloriesCard}>
          <Text style={styles.caloriesTitle}>NĂNG LƯỢNG MỤC TIÊU HÀNG NGÀY</Text>
          <View style={styles.caloriesNumberContainer}>
            <Text style={styles.caloriesValue}>{targetCalories}</Text>
            <Text style={styles.caloriesUnit}>kcal / ngày</Text>
          </View>

          {/* Macros Progress Bars */}
          <Text style={styles.macrosSectionTitle}>BẢN ĐỒ DINH DƯỠNG (MACRONUTRIENTS)</Text>
          
          {/* Protein */}
          <View style={styles.macroProgressContainer}>
            <View style={styles.macroInfoRow}>
              <Text style={styles.macroLabel}>Protein (Đạm)</Text>
              <Text style={styles.macroValues}>{targetProtein}g <Text style={styles.macroKcal}>({targetProtein * 4} kcal)</Text></Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '100%', backgroundColor: Colors.primary }]} />
            </View>
          </View>

          {/* Carbs */}
          <View style={styles.macroProgressContainer}>
            <View style={styles.macroInfoRow}>
              <Text style={styles.macroLabel}>Carbs (Tinh bột)</Text>
              <Text style={styles.macroValues}>{targetCarbs}g <Text style={styles.macroKcal}>({targetCarbs * 4} kcal)</Text></Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '100%', backgroundColor: '#4ECDC4' }]} />
            </View>
          </View>

          {/* Fat */}
          <View style={styles.macroProgressContainer}>
            <View style={styles.macroInfoRow}>
              <Text style={styles.macroLabel}>Chất béo (Fat)</Text>
              <Text style={styles.macroValues}>{targetFat}g <Text style={styles.macroKcal}>({targetFat * 9} kcal)</Text></Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '100%', backgroundColor: '#FF9F43' }]} />
            </View>
          </View>
        </View>

        {/* Meal Suggester Section */}
        <View style={styles.suggesterHeader}>
          <Ionicons name="restaurant" size={20} color={Colors.primary} />
          <Text style={styles.suggesterTitle}>Đề Xuất Thực Đơn Khớp Calo</Text>
        </View>

        {/* Segmented Control Tabs */}
        <View style={styles.tabsRow}>
          {[
            { key: 'breakfast', label: 'Bữa Sáng 🍳', target: plan?.targets?.breakfast },
            { key: 'lunch', label: 'Bữa Trưa 🍲', target: plan?.targets?.lunch },
            { key: 'dinner', label: 'Bữa Tối 🥗', target: plan?.targets?.dinner }
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={[styles.tabButton, activeTab === item.key && styles.activeTabButton]}
              onPress={() => setActiveTab(item.key)}
            >
              <Text style={[styles.tabLabel, activeTab === item.key && styles.activeTabLabel]}>{item.label}</Text>
              <Text style={styles.tabTargetCal}>{item.target || 0} kcal</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggested Recipes List */}
        <View style={styles.recipeListContainer}>
          <Text style={styles.recipeListIntro}>
            Các món ăn Việt được tính toán tỉ lệ khớp nhất với năng lượng của {activeTab === 'breakfast' ? 'Bữa Sáng' : activeTab === 'lunch' ? 'Bữa Trưa' : 'Bữa Tối'}:
          </Text>

          {currentMealList.length === 0 ? (
            <Text style={styles.emptyRecipesText}>Không tìm thấy món ăn phù hợp.</Text>
          ) : (
            currentMealList.map(recipe => (
              <View key={recipe.id} style={styles.recipeCard}>
                {recipe.image_url ? (
                  <Image
                    source={{ uri: recipe.image_url }}
                    style={styles.recipeImage}
                  />
                ) : (
                  <View style={styles.recipeImagePlaceholder}>
                    <Ionicons name="restaurant-outline" size={30} color={Colors.primary} />
                  </View>
                )}
                <View style={styles.recipeCardContent}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeCategory}>{recipe.category || 'Món chính'}</Text>
                  
                  {/* Calorie pill & macros row */}
                  <View style={styles.recipeCaloriePill}>
                    <Text style={styles.recipeCalorieText}>{recipe.nutrition?.calories || 450} kcal</Text>
                  </View>

                  <View style={styles.recipeMacroStatsRow}>
                    <Text style={styles.recipeMacroStat}>Protein: <Text style={styles.boldText}>{recipe.nutrition?.protein || 20}g</Text></Text>
                    <Text style={styles.recipeMacroStat}>Carbs: <Text style={styles.boldText}>{recipe.nutrition?.carbs || 45}g</Text></Text>
                    <Text style={styles.recipeMacroStat}>Fat: <Text style={styles.boldText}>{recipe.nutrition?.fat || 12}g</Text></Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.recipeCardActions}>
                    <TouchableOpacity
                      style={styles.viewRecipeBtn}
                      onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
                    >
                      <Ionicons name="book-outline" size={16} color="#666" />
                      <Text style={styles.viewRecipeBtnText}>Công thức</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.scheduleBtn}
                      onPress={() => {
                        setSelectedRecipe(recipe);
                        setIsScheduleModalVisible(true);
                      }}
                    >
                      <Ionicons name="calendar" size={16} color={Colors.white} />
                      <Text style={styles.scheduleBtnText}>Lên lịch ăn</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Select Meal Schedule Modal */}
      <Modal visible={isScheduleModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lên Lịch Ăn Hôm Nay</Text>
              <TouchableOpacity onPress={() => {
                setIsScheduleModalVisible(false);
                setSelectedRecipe(null);
              }}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {selectedRecipe && (
              <View style={styles.modalSelectedRecipeInfo}>
                <Text style={styles.modalRecipeTitle}>{selectedRecipe.title}</Text>
                <Text style={styles.modalRecipeCal}>{selectedRecipe.nutrition?.calories} kcal</Text>
              </View>
            )}

            <Text style={styles.modalInstructionText}>Bạn muốn ăn món này vào bữa nào ngày hôm nay?</Text>

            <TouchableOpacity style={styles.mealSelectBtn} onPress={() => handleAddToPlan('breakfast')}>
              <Text style={styles.mealSelectBtnText}>Bữa Sáng 🍳</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mealSelectBtn} onPress={() => handleAddToPlan('lunch')}>
              <Text style={styles.mealSelectBtnText}>Bữa Trưa 🍲</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mealSelectBtn} onPress={() => handleAddToPlan('dinner')}>
              <Text style={styles.mealSelectBtnText}>Bữa Tối 🥗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NutritionPlannerScreen;
