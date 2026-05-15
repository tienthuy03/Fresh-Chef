import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '@constants/Config';
import { useGetCommentsQuery } from '@redux/api/Community';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FeedItem = ({
  item,
  onFollow,
  onLike,
  onShare,
  onComment,
  currentUserId,
  onDelete,
  onEdit,
}) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');

  const navigation = useNavigation();
  const { data: commentsData, isLoading: isLoadingComments } =
    useGetCommentsQuery(item.id, {
      skip: !showComments,
    });

  const isOwnPost = item.UserId === currentUserId;

  const handleScroll = event => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const timeAgo = date => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ` ${t('years_ago')}`;
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ` ${t('months_ago')}`;
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ` ${t('days_ago')}`;
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ` ${t('hours_ago')}`;
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ` ${t('mins_ago')}`;
    return Math.floor(seconds) + ` ${t('seconds_ago')}`;
  };

  const foodIcons = [
    'pizza',
    'hamburger',
    'ice-cream',
    'food-apple',
    'noodles',
    'cake-variant',
    'cheese',
  ];
  const foodIcon = React.useMemo(
    () => foodIcons[item.id % foodIcons.length],
    [item.id],
  );

  return (
    <View style={styles.chefCard}>
      {/* Culinary Category/Context Ribbon */}
      <View style={styles.ribbonContainer}>
        <View style={styles.culinaryRibbon}>
          <MaterialCommunityIcons
            name="chef-hat"
            size={14}
            color={Colors.white}
          />
          <Text style={styles.ribbonText}>
            {t('chef_entry', 'Sổ tay đầu bếp')}
          </Text>
        </View>
        <View style={styles.timeTag}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={12}
            color={Colors.textLight}
          />
          <Text style={styles.timeTagText}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>

      {/* Main Culinary Image with rounded corners and shadow */}
      {item.images && item.images.length > 0 && (
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.culinaryImageScroll}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {item.images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: `${BASE_URL}${img}` }}
                style={styles.culinaryImage}
              />
            ))}
          </ScrollView>
          {item.images.length > 1 && (
            <View style={styles.culinaryBadge}>
              <Text style={styles.culinaryBadgeText}>
                {activeIndex + 1}/{item.images.length}
              </Text>
            </View>
          )}

          {/* Chef Badge Overlay */}
          <View style={styles.chefBadgeOverlay}>
            <Image
              source={{
                uri: item.User?.avatar
                  ? item.User.avatar.startsWith('http')
                    ? item.User.avatar
                    : `${BASE_URL}${item.User.avatar}`
                  : `https://i.pravatar.cc/150?u=${item.UserId}`,
              }}
              style={styles.chefAvatarSmall}
            />
            <Text style={styles.chefNameSmall}>{item.User?.username}</Text>
          </View>
        </View>
      )}

      {/* Content Section - Styled like a Kitchen Note */}
      <View style={styles.noteSection}>
        {item.Recipe && (
          <TouchableOpacity 
            style={styles.recipeLink}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.Recipe.id })}
          >
            <MaterialCommunityIcons
              name="chef-hat"
              size={16}
              color={Colors.primary}
              style={{marginRight: 5}}
            />
            <Text style={styles.recipeLinkTitle}>{item.Recipe.title}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={Colors.primary}
            />
          </TouchableOpacity>
        )}

        <View style={styles.quoteMark}>
          <MaterialCommunityIcons
            name="format-quote-open"
            size={20}
            color={Colors.border}
          />
        </View>
        <Text style={styles.culinaryContent}>{item.content}</Text>

        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map(s => (
            <MaterialCommunityIcons
              key={s}
              name="star"
              size={18}
              color={s <= item.rating ? Colors.accent : Colors.border}
            />
          ))}
        </View>
      </View>

      {/* Social/Culinary Stats Row */}
      <View style={styles.culinaryStats}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name={foodIcon}
            size={18}
            color={item.isLiked ? '#FF4500' : Colors.textLight}
          />
          <Text
            style={[styles.statValue, item.isLiked && { color: '#FF4500' }]}
          >
            {item.likes || 0}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => setShowComments(!showComments)}
        >
          <MaterialCommunityIcons
            name="comment-text-multiple-outline"
            size={18}
            color={Colors.textLight}
          />
          <Text style={styles.statValue}>{item.comments || 0}</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {isOwnPost && (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={styles.ownerBtn}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color={Colors.textLight}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={styles.ownerBtn}
            >
              <MaterialCommunityIcons
                name="delete"
                size={18}
                color={Colors.error}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Action Buttons - Styled uniquely */}
      <View style={styles.culinaryActionRow}>
        <TouchableOpacity
          style={[styles.actionButton, item.isLiked && styles.actionActive]}
          onPress={() => onLike(item.id)}
        >
          <MaterialCommunityIcons
            name={item.isLiked ? `${foodIcon}-outline` : 'fire'}
            size={22}
            color={item.isLiked ? Colors.white : Colors.text}
          />
          <Text
            style={[
              styles.actionLabel,
              item.isLiked && { color: Colors.white },
            ]}
          >
            {item.isLiked ? 'Ngon quá!' : 'Ngon!'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <MaterialCommunityIcons
            name="pot-mix"
            size={22}
            color={Colors.text}
          />
          <Text style={styles.actionLabel}>{t('comment')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare && onShare(item)}
        >
          <MaterialCommunityIcons
            name="room-service-outline"
            size={22}
            color={Colors.text}
          />
          <Text style={styles.actionLabel}>{t('share')}</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsTray}>
          {isLoadingComments ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            commentsData?.Data?.map(comment => (
              <View key={comment.id} style={styles.culinaryComment}>
                <Image
                  source={{
                    uri: comment.User?.avatar
                      ? comment.User.avatar.startsWith('http')
                        ? comment.User.avatar
                        : `${BASE_URL}${comment.User.avatar}`
                      : `https://i.pravatar.cc/150?u=${comment.UserId}`,
                  }}
                  style={styles.commentChefAvatar}
                />
                <View style={styles.commentChefBox}>
                  <Text style={styles.commentChefName}>
                    {comment.User?.username}
                  </Text>
                  <Text style={styles.commentChefText}>{comment.content}</Text>
                </View>
              </View>
            ))
          )}

          {/* Inline Comment Input with Quick Icons */}
          <View style={styles.commentInputContainer}>
            <View style={styles.quickIconsRow}>
              {['😋', '🔥', '👩‍🍳', '🍲', '🥩', '🍰', '🍻'].map((emoji) => (
                <TouchableOpacity 
                  key={emoji} 
                  style={styles.quickIconBtn}
                  onPress={() => setCommentText(prev => prev + emoji)}
                >
                  <Text style={styles.quickIconText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.commentInputRow}>
              <React.Fragment>
                {/* Need to import TextInput from react-native */}
              </React.Fragment>
              <TextInput
                style={styles.commentInput}
                placeholder="Nhập bình luận hoặc chọn icon..."
                placeholderTextColor={Colors.textLight}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity 
                style={styles.sendCommentBtn}
                onPress={() => {
                  if (commentText.trim() && onComment) {
                    onComment({ id: item.id, content: commentText.trim() });
                    setCommentText('');
                  }
                }}
              >
                <MaterialCommunityIcons name="send" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chefCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  ribbonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  culinaryRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ribbonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTagText: {
    fontSize: 11,
    color: Colors.textLight,
    marginLeft: 4,
  },
  imageContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F2F5',
  },
  culinaryImageScroll: {
    width: SCREEN_WIDTH - 60,
  },
  culinaryImage: {
    width: SCREEN_WIDTH - 60,
    height: 300,
    resizeMode: 'cover',
  },
  culinaryBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  culinaryBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  chefBadgeOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 4,
    paddingRight: 10,
    borderRadius: 20,
  },
  chefAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  chefNameSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 6,
  },
  noteSection: {
    marginTop: 15,
    paddingHorizontal: 5,
  },
  recipeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFEFEF',
  },
  recipeLinkTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  quoteMark: {
    marginBottom: -5,
  },
  culinaryContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  ratingStars: {
    flexDirection: 'row',
    marginTop: 10,
  },
  culinaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statValue: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 4,
    fontWeight: '600',
  },
  ownerActions: {
    flexDirection: 'row',
  },
  ownerBtn: {
    padding: 5,
    marginLeft: 10,
  },
  culinaryActionRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  actionActive: {
    backgroundColor: '#FF4500',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 6,
  },
  commentsTray: {
    marginTop: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 10,
  },
  culinaryComment: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentChefAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  commentChefBox: {
    flex: 1,
    marginLeft: 8,
  },
  commentChefName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  commentChefText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  commentInputContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
    paddingTop: 12,
  },
  quickIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  quickIconBtn: {
    padding: 5,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickIconText: {
    fontSize: 20,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 14,
    color: Colors.text,
  },
  sendCommentBtn: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default FeedItem;
