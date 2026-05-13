import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import { 
  useGetRecipeDetailQuery, 
  useToggleFavoriteMutation, 
  useGetFavoritesQuery 
} from '@redux/api/Recipes';
import { useRoute, useNavigation } from '@react-navigation/native';

const RecipeDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = route.params;

  const { data: response, isLoading } = useGetRecipeDetailQuery(recipeId);
  const { data: favoritesData } = useGetFavoritesQuery();
  const [toggleFavorite, { isLoading: isToggling }] = useToggleFavoriteMutation();

  const recipe = response?.Data;

  const isFavorited = React.useMemo(() => {
    if (!favoritesData?.Data || !recipe) return false;
    return favoritesData.Data.some(f => f.id === recipe.id);
  }, [favoritesData, recipe]);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(recipeId).unwrap();
    } catch (err) {
      console.log('Toggle favorite failed', err);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  // ingredients and steps might be JSON strings or arrays depending on the API mapping
  const ingredients = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients 
    : (typeof recipe.ingredients === 'string' && recipe.ingredients ? JSON.parse(recipe.ingredients) : []);
    
  const steps = Array.isArray(recipe.steps) 
    ? recipe.steps 
    : (typeof recipe.steps === 'string' && recipe.steps ? JSON.parse(recipe.steps) : []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('recipe_detail', 'Chi tiết món')}</Text>
        <TouchableOpacity onPress={handleToggleFavorite} disabled={isToggling}>
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorited ? Colors.error : Colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shopping List Button */}
        <TouchableOpacity 
          style={styles.shoppingListButton}
          onPress={() => navigation.navigate('ShoppingList', { recipeId })}
        >
          <Ionicons name="cart-outline" size={20} color={Colors.white} />
          <Text style={styles.shoppingListButtonText}>{t('view_shopping_list', 'Xem danh sách đi chợ')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{recipe.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={18} color={Colors.textLight} />
            <Text style={styles.metaText}>{recipe.time || '30 min'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={18} color={Colors.textLight} />
            <Text style={styles.metaText}>{recipe.servings || '2 người'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('ingredients', 'Nguyên liệu')}</Text>
        {ingredients.map((item, index) => (
          <View key={index} style={styles.ingredientItem}>
            <View style={styles.ingredientDot} />
            <Text style={styles.ingredientText}>
              {item.name} {item.quantity ? `- ${item.quantity}` : ''}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>{t('instructions', 'Cách làm')}</Text>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>
                {typeof step === 'string' ? step : (step.text || step.instruction || JSON.stringify(step))}
              </Text>
            </View>
            {typeof step === 'object' && step.image ? (
              <Image source={{ uri: step.image.replace(/\d+x\d+cq\d+/, '680x482cq70') }} style={styles.stepImage} resizeMode="cover" />
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;
