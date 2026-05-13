import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import { 
  useGetRecipesQuery, 
  useToggleFavoriteMutation, 
  useGetFavoritesQuery 
} from '@redux/api/Recipes';
import { useNavigation } from '@react-navigation/native';
import RecipeListItem from '@components/Recipe/RecipeListItem';

const AllRecipesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useGetRecipesQuery();
  const { data: favoritesData } = useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const favoriteIds = useMemo(() => {
    return (favoritesData?.Data || []).map(f => f.id);
  }, [favoritesData]);

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id).unwrap();
    } catch (err) {
      console.log('Toggle favorite error:', err);
    }
  };

  const recipes = data?.Data || (Array.isArray(data) ? data : []);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery) return recipes;
    return recipes.filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recipes, searchQuery]);

  const renderRecipe = ({ item }) => (
    <RecipeListItem 
      item={item}
      isFavorited={favoriteIds.includes(item.id)}
      onFavoritePress={handleToggleFavorite}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('all_recipes', 'Tất cả công thức')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          placeholder={t('search_all_placeholder', 'Tìm kiếm trong danh sách...')}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color={Colors.border} />
              <Text style={styles.emptyText}>{t('no_recipes_found', 'Không tìm thấy món nào')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default AllRecipesScreen;
