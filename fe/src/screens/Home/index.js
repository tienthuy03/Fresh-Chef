import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import {
  useGetTrendingRecipesQuery,
  useToggleFavoriteMutation,
  useGetFavoritesQuery,
} from '@redux/api/Recipes';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RecipeCard from '@components/Recipe/RecipeCard';
import SectionHeader from '@components/GlobalUI/SectionHeader';
import SearchBar from '@components/GlobalUI/SearchBar';

const FEATURED_RECIPES = [
  {
    id: '1',
    title: 'Creamy Avocado Toast',
    author: 'Chef Mario',
    time: '15 min',
    rating: 4.8,
    category: 'Breakfast',
  },
  {
    id: '2',
    title: 'Spicy Thai Basil Beef',
    author: 'Suda S.',
    time: '25 min',
    rating: 4.9,
    category: 'Lunch',
  },
];

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeRecIndex, setActiveRecIndex] = React.useState(0);
  const { data: trendingData, isLoading: isTrendingLoading } =
    useGetTrendingRecipesQuery();
  const { data: favoritesData } = useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const favoriteIds = React.useMemo(() => {
    return (favoritesData?.Data || []).map(f => f.id);
  }, [favoritesData]);

  const handleToggleFavorite = async id => {
    try {
      await toggleFavorite(id).unwrap();
    } catch (err) {
      console.log('Toggle favorite failed', err);
    }
  };

  const recipes = trendingData?.Data || FEATURED_RECIPES;

  const { carouselRecipes, gridRecipes } = React.useMemo(() => {
    if (!recipes || recipes.length === 0)
      return { carouselRecipes: [], gridRecipes: [] };

    // Shuffle or just pick different ranges to avoid duplication
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return {
      carouselRecipes: shuffled.slice(0, 5),
      gridRecipes: recipes
        .filter(r => !shuffled.slice(0, 5).some(c => c.id === r.id))
        .slice(0, 10),
    };
  }, [recipes]);

  const onRecommendationScroll = event => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveRecIndex(Math.round(index));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('hi_there')}, 👋</Text>
          <Text style={styles.headerTitle}>{t('what_to_cook_today')}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.text}
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        // showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        {/* <View style={styles.searchContainer}>
          <SearchBar
            placeholder={t('search_recipes_placeholder')}
            rightAction={
              <Ionicons name="options-outline" size={20} color={Colors.white} />
            }
            onRightActionPress={() => {}}
          />
        </View> */}

        {/* Recommendation Carousel */}
        {carouselRecipes && carouselRecipes.length > 0 && (
          <View style={styles.recommendationWrapper}>
            <FlatList
              data={carouselRecipes}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onRecommendationScroll}
              scrollEventThrottle={16}
              keyExtractor={item => `rec-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recommendationCard}
                  onPress={() =>
                    navigation.navigate('RecipeDetail', { recipeId: item.id })
                  }
                >
                  <View style={styles.recommendationContent}>
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationTag}>
                        {t('weekly_pick', 'Gợi ý cho bạn')}
                      </Text>
                      <Ionicons
                        name="sparkles"
                        size={20}
                        color={Colors.primary}
                      />
                    </View>
                    <Text style={styles.recommendationTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.recommendationMeta}>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={Colors.textLight}
                        />
                        <Text style={styles.recipeMetaText}>
                          {item.time || '30 min'}
                        </Text>
                      </View>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="star"
                          size={16}
                          color="#FFD700"
                          style={{ marginRight: 2 }}
                        />
                        <Text style={styles.recipeMetaText}>
                          {item.rating || '4.5'}
                        </Text>
                      </View>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color={Colors.textLight}
                        />
                        <Text style={styles.recipeMetaText}>
                          {item.servings || '2 người'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              {carouselRecipes.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeRecIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
        {/* Featured Section */}
        <SectionHeader
          title={t('featured_recipes')}
          onActionPress={() => navigation.navigate('AllRecipes')}
        />
        {isTrendingLoading ? (
          <View style={{ marginVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={{ marginTop: 10, color: Colors.textLight }}>
              {t('loading_recipes', 'Đang tìm kiếm món ngon...')}
            </Text>
          </View>
        ) : recipes.length === 0 ? (
          <View
            style={{
              marginVertical: 60,
              alignItems: 'center',
              paddingHorizontal: 40,
            }}
          >
            <Ionicons
              name="restaurant-outline"
              size={60}
              color={Colors.primary}
              style={{ opacity: 0.5 }}
            />
            <Text
              style={{
                marginTop: 20,
                fontSize: 18,
                fontWeight: '600',
                color: Colors.text,
                textAlign: 'center',
              }}
            >
              {t('preparing_recipes_title', 'Đang chuẩn bị thực đơn...')}
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontSize: 14,
                color: Colors.textLight,
                textAlign: 'center',
              }}
            >
              {t(
                'preparing_recipes_desc',
                'Chờ một chút nhé, chúng mình đang cập nhật những công thức nấu ăn mới nhất cho bạn.',
              )}
            </Text>
            <ActivityIndicator
              color={Colors.primary}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <View style={styles.featuredGrid}>
            {gridRecipes.map(item => (
              <View key={String(item.id)} style={styles.recipeCardWrapper}>
                <RecipeCard
                  item={item}
                  isFavorited={favoriteIds.includes(item.id)}
                  onFavoritePress={handleToggleFavorite}
                  onPress={() =>
                    navigation.navigate('RecipeDetail', { recipeId: item.id })
                  }
                />
              </View>
            ))}
          </View>
        )}

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
