import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import {
  useGetRecipeDetailQuery,
  useToggleFavoriteMutation,
  useGetFavoritesQuery,
} from '@redux/api/Recipes';
import {
  usePostReviewMutation,
  useGetRecipeReviewsQuery,
  useLikeReviewMutation,
  useFollowUserMutation,
  useShareReviewMutation,
  usePostCommentMutation,
} from '@redux/api/Community';
import { useRoute, useNavigation } from '@react-navigation/native';
import ReviewModal from '@components/Community/ReviewModal';
import FeedItem from '@components/Community/FeedItem';
import { useGetMeQuery } from '@redux/api/Auth';
import { Share } from 'react-native';
import { useAddMealPlanMutation } from '@redux/api/MealPlans';
import MealPlanModal from '@components/Recipe/MealPlanModal';
import SmartCookingVideoModal from '@components/Recipe/SmartCookingVideoModal';

const RecipeDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = route.params;

  const { data: response, isLoading } = useGetRecipeDetailQuery(recipeId);
  const { data: favoritesData } = useGetFavoritesQuery();
  const [toggleFavorite, { isLoading: isToggling }] =
    useToggleFavoriteMutation();
  const [postReview, { isLoading: isPosting }] = usePostReviewMutation();
  const { data: reviewsData, refetch: refetchReviews } =
    useGetRecipeReviewsQuery(recipeId);
  const { data: meData } = useGetMeQuery();
  const [likeReview] = useLikeReviewMutation();
  const [followUser] = useFollowUserMutation();
  const [shareReview] = useShareReviewMutation();
  const [postComment] = usePostCommentMutation();
  const [addMealPlan, { isLoading: isAddingMealPlan }] = useAddMealPlanMutation();

  const currentUserId = meData?.Data?.id;

  const [modalVisible, setModalVisible] = React.useState(false);
  const [mealPlanModalVisible, setMealPlanModalVisible] = React.useState(false);
  const [videoModalVisible, setVideoModalVisible] = React.useState(false);

  const recipe = response?.Data;

  const handlePostReview = async formData => {
    const { content, rating, selectedImages } = formData;
    if (!content) {
      Alert.alert(t('error_title'), t('missing_fields'));
      return;
    }

    try {
      const body = new FormData();
      body.append('content', content);
      body.append('rating', rating);
      body.append('recipeId', recipeId);

      selectedImages.forEach((img, index) => {
        body.append('images', {
          uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
          type: img.type,
          name: img.fileName || `image_${index}.jpg`,
        });
      });

      await postReview(body).unwrap();
      setModalVisible(false);
      Alert.alert(t('success_title'), t('post_success'));
    } catch (err) {
      Alert.alert(t('error_title'), t('post_error'));
    }
  };

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

  const handleLike = async reviewId => {
    try {
      await likeReview(reviewId).unwrap();
    } catch (err) {
      console.log('Like error:', err);
    }
  };

  const handleFollow = async userId => {
    try {
      await followUser(userId).unwrap();
    } catch (err) {
      console.log('Follow error:', err);
    }
  };

  const handleShare = async item => {
    try {
      const result = await Share.share({
        message: `${t('check_out_recipe')}: ${
          item.Recipe?.title || recipe.title
        }\n${item.content}\nShared from Fresh Chef App`,
      });
      if (result.action === Share.sharedAction) {
        await shareReview(item.id);
      }
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  const handleComment = async ({ id, content }) => {
    if (!content) return;
    try {
      await postComment({ reviewId: id, content }).unwrap();
    } catch (err) {
      Alert.alert(t('error_title'), 'Failed to post comment');
    }
  };

  const handleAddMealPlan = async ({ date, mealType }) => {
    try {
      await addMealPlan({
        recipeId,
        date,
        mealType,
      }).unwrap();
      setMealPlanModalVisible(false);
      Alert.alert(t('success_title'), t('add_meal_plan_success', 'Đã thêm vào kế hoạch ăn uống!'));
    } catch (err) {
      Alert.alert(t('error_title'), t('add_meal_plan_failed', 'Lỗi khi thêm vào kế hoạch ăn uống'));
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text>Recipe not found</Text>
      </View>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : typeof recipe.ingredients === 'string' && recipe.ingredients
    ? JSON.parse(recipe.ingredients)
    : [];

  const steps = Array.isArray(recipe.steps)
    ? recipe.steps
    : typeof recipe.steps === 'string' && recipe.steps
    ? JSON.parse(recipe.steps)
    : [];

  return (
    <View style={styles.container}>
      <ReviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handlePostReview}
        isLoading={isPosting}
        initialRecipe={recipe}
      />
      <MealPlanModal
        visible={mealPlanModalVisible}
        onClose={() => setMealPlanModalVisible(false)}
        onSubmit={handleAddMealPlan}
        isLoading={isAddingMealPlan}
        recipeTitle={recipe.title}
      />
      <SmartCookingVideoModal
        visible={videoModalVisible}
        onClose={() => setVideoModalVisible(false)}
        recipe={recipe}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('recipe_detail', 'Chi tiết món')}
        </Text>
        <TouchableOpacity onPress={handleToggleFavorite} disabled={isToggling}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorited ? Colors.error : Colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{recipe.title}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={18} color={Colors.textLight} />
            <Text style={styles.metaText}>{recipe.time || '30 min'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="people-outline"
              size={18}
              color={Colors.textLight}
            />
            <Text style={styles.metaText}>{recipe.servings || '2 người'}</Text>
          </View>
        </View>

        {/* Side-by-side Compact Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.compactActionButton}
            onPress={() => navigation.navigate('ShoppingList', { recipeId })}
          >
            <Ionicons name="cart-outline" size={18} color={Colors.white} />
            <Text style={styles.compactActionButtonText} numberOfLines={1}>
              {t('view_shopping_list', 'Đi chợ')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.compactActionButton, { backgroundColor: Colors.secondary }]}
            onPress={() => setMealPlanModalVisible(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.white} />
            <Text style={styles.compactActionButtonText} numberOfLines={1}>
              {t('add_to_meal_plan', 'Lên kế hoạch')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.videoBanner}
          onPress={() => setVideoModalVisible(true)}
        >
          <Image source={{ uri: recipe.image_url }} style={styles.videoBannerImage} />
          <View style={styles.videoBannerOverlay}>
            <View style={styles.videoPlayIconBg}>
              <Ionicons name="play" size={20} color={Colors.white} />
            </View>
            <View style={styles.videoBannerTextContainer}>
              <View style={styles.videoBannerBadge}>
                <Text style={styles.videoBannerBadgeText}>AI STEP SYNC</Text>
              </View>
              <Text style={styles.videoBannerTitle}>Xem Video Hướng Dẫn Từng Bước</Text>
              <Text style={styles.videoBannerSubtitle}>Tự động đồng bộ các bước làm món</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          {t('ingredients', 'Nguyên liệu')}
        </Text>
        {ingredients.map((item, index) => (
          <View key={index} style={styles.ingredientItem}>
            <View style={styles.ingredientDot} />
            <Text style={styles.ingredientText}>
              {item.name} {item.quantity ? `- ${item.quantity}` : ''}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>
          {t('instructions', 'Cách làm')}
        </Text>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>
                {typeof step === 'string'
                  ? step
                  : step.text || step.instruction || JSON.stringify(step)}
              </Text>
            </View>
            {typeof step === 'object' && step.image ? (
              <Image
                source={{
                  uri: step.image.replace(/\d+x\d+cq\d+/, '680x482cq70'),
                }}
                style={styles.stepImage}
                resizeMode="cover"
              />
            ) : null}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="camera" size={28} color={Colors.white} />
        <Text style={styles.floatingActionText}>{t('share_result')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RecipeDetailScreen;
