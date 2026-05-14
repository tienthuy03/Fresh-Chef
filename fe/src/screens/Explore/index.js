import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import RecipeListItem from '@components/Recipe/RecipeListItem';
import SectionHeader from '@components/GlobalUI/SectionHeader';
import PrimaryButton from '@components/GlobalUI/PrimaryButton';
import SearchBar from '@components/GlobalUI/SearchBar';
import {
  useGetCategoriesQuery,
  useSearchRecipesQuery,
  useSyncRecipesMutation,
  useSuggestRecipesMutation,
} from '@redux/api/Recipes';
import { ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';


const COMMON_INGREDIENTS = [
  'Thịt bò', 'Thịt lợn', 'Thịt gà', 'Cá', 'Tôm', 
  'Trứng', 'Cà chua', 'Khoai tây', 'Cà rốt', 'Hành tây', 
  'Tỏi', 'Ớt', 'Rau muống', 'Đậu phụ', 'Nấm', 
  'Sữa', 'Phô mai', 'Mỳ tôm'
];

const ExploreScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSuggestModalVisible, setIsSuggestModalVisible] = React.useState(false);
  const [selectedIngredients, setSelectedIngredients] = React.useState([]);
  const [customIngredient, setCustomIngredient] = React.useState('');
  
  const { data: categoriesData } = useGetCategoriesQuery();
  const [suggestRecipes, { data: suggestData, isLoading: isSuggesting }] = useSuggestRecipesMutation();
  const {
    data: searchData,
    isFetching: isSearching,
    refetch: refetchSearch,
  } = useSearchRecipesQuery(searchQuery, {
    skip: searchQuery.length < 2,
  });

  const searchResults = searchData?.Data || [];
  const suggestedResults = suggestData?.Data || [];
  const trendingKeywords = categoriesData?.Data || [];

  const handleSuggest = async () => {
    if (selectedIngredients.length > 0) {
      await suggestRecipes({ ingredients: selectedIngredients });
      setIsSuggestModalVisible(false);
      setSearchQuery('');
    }
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, customIngredient.trim()]);
      setCustomIngredient('');
    }
  };

  const toggleIngredient = (ing) => {
    if (selectedIngredients.includes(ing)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ing));
    } else {
      setSelectedIngredients([...selectedIngredients, ing]);
    }
  };

  const handleKeywordPress = async keyword => {
    setSearchQuery(keyword);
  };

  const renderRecipeItem = ({ item }) => (
    <RecipeListItem
      item={item}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('explore', 'Khám phá')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchBarContainer}> 
            <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('search_placeholder', 'Tìm kiếm công thức...')}
          isLoading={isSearching}
          onClear={() => setSearchQuery('')}
          containerStyle={{ paddingHorizontal: 0}}
        />
        </View>
      

        {/* Magic Suggest Card */}
        <TouchableOpacity
          style={styles.magicCard}
          onPress={() => setIsSuggestModalVisible(true)}
        >
          <View style={styles.magicContent}>
            <View style={styles.magicHeader}>
              <Text style={styles.magicTag}>
                {t('magic_suggest', 'Gợi ý thông minh')}
              </Text>
              <Ionicons name="sparkles" size={24} color={Colors.white} />
            </View>
            <Text style={styles.magicTitle}>Tủ lạnh bạn còn gì?</Text>
            <Text style={styles.magicDesc}>
              Chọn nguyên liệu bạn có, chúng tôi sẽ gợi ý món ngon cho bạn!
            </Text>
            <View style={styles.magicButton}>
              <Text style={styles.magicButtonText}>Thử ngay</Text>
            </View>
          </View>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60',
            }}
            style={styles.magicImage}
          />
        </TouchableOpacity>

        {/* Suggest Results Section */}
        {suggestedResults.length > 0 && searchQuery === '' && (
          <View style={styles.searchResultsSection}>
            <SectionHeader 
              title={t('suggested_for_you', 'Gợi ý dựa trên nguyên liệu')}
              onActionPress={() => suggestRecipes({ ingredients: selectedIngredients })}
              actionComponent={<Ionicons name="refresh" size={20} color={Colors.primary} />}
            />
            <View style={styles.ingredientsSummary}>
              {selectedIngredients.map(ing => (
                <View key={ing} style={styles.ingChip}>
                  <Text style={styles.ingChipText}>{ing}</Text>
                </View>
              ))}
            </View>
            {suggestedResults.map(item => (
              <View key={item.id} style={{ marginBottom: 10 }}>
                <RecipeListItem
                  item={item}
                  onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
                  showMatchScore={true}
                />
              </View>
            ))}
          </View>
        )}

        {/* Trending Keywords */}
        <SectionHeader title={t('trending_now', 'Xu hướng tìm kiếm')} />
        <View style={styles.keywordsContainer}>
          {trendingKeywords.slice(0, 10).map((keyword, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.keywordBadge,
                searchQuery === keyword && styles.activeKeywordBadge,
              ]}
              onPress={() => handleKeywordPress(keyword)}
            >
              <Text
                style={[
                  styles.keywordText,
                  searchQuery === keyword && styles.activeKeywordText,
                ]}
              >
                {keyword}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Search Results Overlay-like section */}
        {searchQuery.length >= 2 && (
          <View style={styles.searchResultsSection}>
            <SectionHeader title={t('search_results', 'Kết quả tìm kiếm')} />
            {searchResults.length > 0 ? (
              searchResults.map(item => (
                <View key={item.id}>{renderRecipeItem({ item })}</View>
              ))
            ) : isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={styles.loadingText}>
                  {t('fetching_recipes', 'Đang tìm kiếm món ngon cho bạn...')}
                </Text>
              </View>
            ) : (
              <Text style={styles.noResultsText}>
                {t('no_results', 'Không tìm thấy kết quả')}
              </Text>
            )}
          </View>
        )}

        {/* Suggest Modal */}
        <Modal
          visible={isSuggestModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsSuggestModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn nguyên liệu bạn có</Text>
                <TouchableOpacity onPress={() => setIsSuggestModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Custom Input */}
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Thêm nguyên liệu khác..."
                  value={customIngredient}
                  onChangeText={setCustomIngredient}
                  onSubmitEditing={addCustomIngredient}
                />
                <TouchableOpacity 
                  style={styles.addCustomButton} 
                  onPress={addCustomIngredient}
                >
                  <Ionicons name="add" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalScroll} 
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.ingredientsGrid}>
                  {COMMON_INGREDIENTS.map(ing => (
                    <TouchableOpacity
                      key={ing}
                      style={[
                        styles.ingredientItem,
                        selectedIngredients.includes(ing) && styles.ingredientItemSelected
                      ]}
                      onPress={() => toggleIngredient(ing)}
                    >
                      <Text style={[
                        styles.ingredientText,
                        selectedIngredients.includes(ing) && styles.ingredientTextSelected
                      ]}>{ing}</Text>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Selected Custom Ingredients */}
                  {selectedIngredients.filter(ing => !COMMON_INGREDIENTS.includes(ing)).map(ing => (
                    <TouchableOpacity
                      key={ing}
                      style={[styles.ingredientItem, styles.ingredientItemSelected]}
                      onPress={() => toggleIngredient(ing)}
                    >
                      <Text style={styles.ingredientTextSelected}>{ing}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <PrimaryButton 
                title={t('find_recipes', `Tìm món ngon (Đã chọn ${selectedIngredients.length})`)}
                onPress={handleSuggest}
                isLoading={isSuggesting}
                disabled={selectedIngredients.length === 0}
                style={styles.suggestButton}
              />
            </View>
          </View>
        </Modal>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

import styles from './styles';

export default ExploreScreen;
