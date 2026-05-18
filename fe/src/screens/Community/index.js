import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Alert, ImageBackground, Dimensions, Platform, Share } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { 
  useGetFeedQuery, 
  useGetUsersQuery,
  useFollowUserMutation, 
  usePostReviewMutation, 
  useLikeReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useShareReviewMutation,
  usePostCommentMutation,
  useGetUserReviewsQuery
} from '@redux/api/Community';
import { useGetRecipesQuery } from '@redux/api/Recipes';
import { useGetMeQuery } from '@redux/api/Auth';
import { BASE_URL } from '@constants/Config';

const UserItem = ({ item, onFollow }) => {
  const { t } = useTranslation();
  const isFollowing = item.isFollowing;
  return (
    <View style={styles.userCard}>
      <Image 
        source={{ 
          uri: item.avatar 
            ? (item.avatar.startsWith('http') ? item.avatar : BASE_URL + item.avatar)
            : `https://i.pravatar.cc/150?u=${item.id}` 
        }} 
        style={styles.userAvatar} 
      />
      <Text style={styles.userFullName} numberOfLines={1}>
        {item.fullName || item.username}
      </Text>
      <TouchableOpacity 
        style={isFollowing ? styles.followingSmallButton : styles.followSmallButton} 
        onPress={() => onFollow(item.id)}
      >
        <Text style={isFollowing ? styles.followingSmallButtonText : styles.followSmallButtonText}>
          {isFollowing ? t('following') : t('connect')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

import FeedItem from '@components/Community/FeedItem';
import SectionHeader from '@components/GlobalUI/SectionHeader';
import ReviewModal from '@components/Community/ReviewModal';

const CommunityScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [feedType, setFeedType] = React.useState('discover');
  const { data: meData } = useGetMeQuery();
  const currentUserId = meData?.Data?.id;

  const { data: feedData, isLoading: isLoadingFeed, refetch: refetchFeed } = useGetFeedQuery(feedType, {
    skip: feedType === 'my-posts'
  });
  
  const { data: myReviewsData, isLoading: isLoadingMyReviews, refetch: refetchMyReviews } = useGetUserReviewsQuery(currentUserId, {
    skip: !currentUserId || feedType !== 'my-posts'
  });

  const { data: usersData } = useGetUsersQuery();
  const { data: recipesData } = useGetRecipesQuery();
  const [followUser] = useFollowUserMutation();
  const [postReview, { isLoading: isPosting }] = usePostReviewMutation();
  const [likeReview] = useLikeReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();

  const isLoading = feedType === 'my-posts' ? isLoadingMyReviews : isLoadingFeed;
  const feedDataToDisplay = feedType === 'my-posts' ? myReviewsData?.Data : feedData?.Data;

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingReviewId, setEditingReviewId] = React.useState(null);

  const [shareReview] = useShareReviewMutation();
  const [postComment] = usePostCommentMutation();

  const handleFollow = async (userId) => {
    try {
      await followUser(userId).unwrap();
    } catch (err) {
      console.log('Follow error:', err);
    }
  };

  const handleLike = async (reviewId) => {
    try {
      await likeReview(reviewId).unwrap();
    } catch (err) {
      console.log('Like error:', err);
    }
  };

  const handleShare = async (item) => {
    try {
      const result = await Share.share({
        message: `${t('check_out_recipe')}: ${item.Recipe?.title || ''}\n${item.content}\nShared from Fresh Chef App`,
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

  const handleDelete = async (reviewId) => {
    Alert.alert(
      t('delete'),
      t('delete_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId).unwrap();
              Alert.alert(t('success_title'), t('delete_success'));
            } catch (err) {
              Alert.alert(t('error_title'), 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item) => {
    setEditingReviewId(item.id);
    setModalVisible(true);
  };

  const handlePostReview = async (formData) => {
    const { content, rating, recipeId, selectedImages, existingImages } = formData;
    
    // Validate
    if (!content) {
      Alert.alert(t('error_title'), t('missing_fields'));
      return;
    }

    if (!editingReviewId && !recipeId) {
      Alert.alert(t('error_title'), t('choose_recipe'));
      return;
    }

    try {
      const body = new FormData();
      body.append('content', content);
      body.append('rating', rating);
      
      if (recipeId) {
        body.append('recipeId', recipeId);
      }

      // Add existing images if updating
      if (editingReviewId && existingImages) {
        body.append('existingImages', JSON.stringify(existingImages));
      }

      // Add new selected images
      selectedImages.forEach((img, index) => {
        body.append('images', {
          uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `image_${Date.now()}_${index}.jpg`,
        });
      });

      if (editingReviewId) {
        await updateReview({ 
          reviewId: editingReviewId, 
          data: body 
        }).unwrap();
        Alert.alert(t('success_title'), t('update_success'));
      } else {
        await postReview(body).unwrap();
        Alert.alert(t('success_title'), t('post_success'));
      }
      
      setModalVisible(false);
      setEditingReviewId(null);
    } catch (err) {
      console.log('Post/Update error:', err);
      Alert.alert(t('error_title'), t('post_error'));
    }
  };

  if (isLoading && !feedDataToDisplay) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ReviewModal 
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingReviewId(null);
        }}
        onSubmit={handlePostReview}
        isLoading={isPosting}
        recipes={recipesData?.Data}
        initialData={editingReviewId ? feedDataToDisplay?.find(r => r.id === editingReviewId) : null}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('community')}</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={feedDataToDisplay || []}
        renderItem={({ item }) => (
          <FeedItem 
            item={item} 
            onFollow={handleFollow} 
            onLike={handleLike} 
            onShare={handleShare}
            onComment={handleComment}
            currentUserId={currentUserId} 
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        onRefresh={feedType === 'my-posts' ? refetchMyReviews : refetchFeed}
        refreshing={isLoading}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => {
          if (isLoading) return null;
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <Ionicons name="images-outline" size={48} color={Colors.border} style={{ marginBottom: 10 }} />
              <Text style={{ color: Colors.textLight, fontSize: 16, textAlign: 'center' }}>
                {feedType === 'my-posts' 
                  ? 'Bạn chưa chia sẻ bài viết nào lên cộng đồng.' 
                  : 'Không có bài viết nào.'}
              </Text>
            </View>
          );
        }}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, feedType === 'following' && styles.activeTab]}
                onPress={() => setFeedType('following')}
              >
                <Text style={[styles.tabText, feedType === 'following' && styles.activeTabText]}>{t('following')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, feedType === 'discover' && styles.activeTab]}
                onPress={() => setFeedType('discover')}
              >
                <Text style={[styles.tabText, feedType === 'discover' && styles.activeTabText]}>{t('discover')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, feedType === 'my-posts' && styles.activeTab]}
                onPress={() => setFeedType('my-posts')}
              >
                <Text style={[styles.tabText, feedType === 'my-posts' && styles.activeTabText]}>Của bạn</Text>
              </TouchableOpacity>
            </View>

            {feedType === 'discover' && usersData?.Data?.length > 0 && (
              <View style={styles.suggestedSection}>
                <SectionHeader title={t('suggested_chefs')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.usersScroll}>
                  {usersData.Data.slice(0, 3).map((user) => (
                    <UserItem key={user.id} item={user} onFollow={handleFollow} />
                  ))}
                  {usersData.Data.length > 3 && (
                    <TouchableOpacity 
                      style={styles.viewAllCard}
                      onPress={() => navigation.navigate('AllChefs')}
                    >
                      <View style={styles.viewAllIconContainer}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={Colors.primary} />
                      </View>
                      <Text style={styles.viewAllText}>{t('view_all', 'Xem tất cả')}</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
      />
    </View>
  );
};

import styles from './styles';

export default CommunityScreen;
