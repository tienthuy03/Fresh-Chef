import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import RecipeListItem from '@components/Recipe/RecipeListItem';
import {
  useGetCategoriesQuery,
  useSearchRecipesQuery,
  useSyncRecipesMutation,
  useSuggestRecipesMutation,
} from '@redux/api/Recipes';
import { ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '@redux/slices/uiSlice';

const TRENDING_KEYWORDS = [
  'Món xào',
  'Ăn sáng',
  'Thịt bò',
  'Món chay',
  'Ăn vặt',
];

const COMMON_INGREDIENTS = [
  'Thịt bò', 'Thịt lợn', 'Thịt gà', 'Cá', 'Tôm', 
  'Trứng', 'Cà chua', 'Khoai tây', 'Cà rốt', 'Hành tây', 
  'Tỏi', 'Ớt', 'Rau muống', 'Đậu phụ', 'Nấm', 
  'Sữa', 'Phô mai', 'Mỳ tôm'
];

const ExploreScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
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
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.textLight}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder={t('search_placeholder', 'Tìm kiếm công thức...')}
            style={styles.searchInput}
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={{ marginLeft: 10 }}
            />
          )}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={{ marginLeft: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textLight}
              />
            </TouchableOpacity>
          )}
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('suggested_for_you', 'Gợi ý dựa trên nguyên liệu')}</Text>
              <TouchableOpacity onPress={() => suggestRecipes({ ingredients: selectedIngredients })}>
                <Ionicons name="refresh" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('trending_now', 'Xu hướng tìm kiếm')}
          </Text>
        </View>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('search_results', 'Kết quả tìm kiếm')}
              </Text>
            </View>
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

              <TouchableOpacity 
                style={[styles.suggestButton, selectedIngredients.length === 0 && { opacity: 0.5 }]}
                onPress={handleSuggest}
                disabled={selectedIngredients.length === 0 || isSuggesting}
              >
                {isSuggesting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.suggestButtonText}>Tìm món ngon (Đã chọn {selectedIngredients.length})</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  searchIcon: {
    position: 'absolute',
    left: 35,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingLeft: 45,
    paddingRight: 20,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  keywordBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keywordText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  categoryGridItem: {
    width: '46%',
    aspectRatio: 1,
    margin: '2%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchResultsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 15,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  resultMetaText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  noResultsText: {
    textAlign: 'center',
    color: Colors.textLight,
    marginTop: 20,
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  activeKeywordBadge: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  activeKeywordText: {
    color: Colors.white,
  },
  magicCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    flexDirection: 'row',
    height: 180,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  magicContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  magicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  magicTag: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 8,
  },
  magicTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  magicDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
  },
  magicButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  magicButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  magicImage: {
    width: '35%',
    height: '100%',
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  ingredientItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    margin: 5,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  ingredientItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ingredientText: {
    fontSize: 14,
    color: Colors.text,
  },
  ingredientTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  suggestButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  suggestButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientsSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  ingChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  ingChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  customInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  customInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  addCustomButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: 300,
  },
  matchBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#F0F7FF',
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  syncStatusText: {
    fontSize: 13,
    color: Colors.secondary,
    marginLeft: 10,
    fontStyle: 'italic',
  },
  promoCard: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: '#E3F2FD',
    borderRadius: 25,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 160,
  },
  promoInfo: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  promoTag: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  promoDesc: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  promoImage: {
    width: '40%',
    height: '100%',
  },
});

export default ExploreScreen;
