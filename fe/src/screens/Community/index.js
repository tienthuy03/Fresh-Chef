import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Alert, ImageBackground, Dimensions, Platform, Share } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { 
  useGetFeedQuery, 
  useGetUsersQuery,
  useFollowUserMutation, 
  usePostReviewMutation, 
  useLikeReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useShareReviewMutation,
  usePostCommentMutation
} from '@redux/api/Community';
import { useGetRecipesQuery } from '@redux/api/Recipes';
import { useGetMeQuery } from '@redux/api/Auth';
import { BASE_URL } from '@constants/Config';

const UserItem = ({ item, onFollow }) => {
  const { t } = useTranslation();
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
      <TouchableOpacity style={styles.followSmallButton} onPress={() => onFollow(item.id)}>
        <Text style={styles.followSmallButtonText}>{t('connect')}</Text>
      </TouchableOpacity>
    </View>
  );
};

import FeedItem from '@components/Community/FeedItem';
import SectionHeader from '@components/GlobalUI/SectionHeader';
import ReviewModal from '@components/Community/ReviewModal';

const CommunityScreen = () => {
  const { t } = useTranslation();
  const [feedType, setFeedType] = React.useState('discover');
  const { data: feedData, isLoading, refetch } = useGetFeedQuery(feedType);
  const { data: usersData } = useGetUsersQuery();
  const { data: recipesData } = useGetRecipesQuery();
  const { data: meData } = useGetMeQuery();
  const [followUser] = useFollowUserMutation();
  const [postReview, { isLoading: isPosting }] = usePostReviewMutation();
  const [likeReview] = useLikeReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();

  const currentUserId = meData?.Data?.id;

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

  if (isLoading && !feedData) {
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
        initialData={editingReviewId ? feedData?.Data?.find(r => r.id === editingReviewId) : null}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('community')}</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={feedData?.Data || []}
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
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
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
            </View>

            {feedType === 'discover' && usersData?.Data?.length > 0 && (
              <View style={styles.suggestedSection}>
                <SectionHeader title={t('suggested_chefs')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.usersScroll}>
                  {usersData.Data.map((user) => (
                    <UserItem key={user.id} item={user} onFollow={handleFollow} />
                  ))}
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
