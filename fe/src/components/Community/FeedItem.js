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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '@constants/Config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FeedItem = ({ item, onFollow, onLike, currentUserId, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const isOwnPost = item.UserId === currentUserId;

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const timeAgo = (date) => {
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

  return (
    <View style={styles.fbPostCard}>
      {/* Header */}
      <View style={styles.fbPostHeader}>
        <Image
          source={{ 
            uri: item.User?.avatar 
              ? (item.User.avatar.startsWith('http') ? item.User.avatar : `${BASE_URL}${item.User.avatar}`)
              : `https://i.pravatar.cc/150?u=${item.UserId}` 
          }}
          style={styles.fbAvatar}
        />
        <View style={styles.fbHeaderInfo}>
          <Text style={styles.fbUserName}>{item.User?.fullName || item.User?.username}</Text>
          <View style={styles.fbTimeRow}>
            <Text style={styles.fbTime}>{timeAgo(item.createdAt)}</Text>
            <Ionicons name="earth" size={12} color={Colors.textLight} style={{ marginLeft: 4 }} />
          </View>
        </View>
        {isOwnPost ? (
          <View style={styles.fbActionMenu}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.fbMoreBtn}>
              <Ionicons name="pencil-outline" size={18} color={Colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.fbMoreBtn}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => onFollow(item.UserId)} style={styles.fbFollowBtn}>
            <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text style={styles.fbContent}>{item.content}</Text>

      {/* Recipe Tag */}
      {item.Recipe && (
        <TouchableOpacity style={styles.fbRecipeTag}>
          <View style={styles.fbRecipeTagIcon}>
            <Ionicons name="restaurant" size={12} color={Colors.white} />
          </View>
          <Text style={styles.fbRecipeTagName}>{t('cooking')}: {item.Recipe.title}</Text>
        </TouchableOpacity>
      )}

      {/* Images */}
      {item.images && item.images.length > 0 && (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.fbPostImageScroll}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {item.images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: `${BASE_URL}${img}` }}
                style={styles.fbPostImage}
              />
            ))}
          </ScrollView>
          {item.images.length > 1 && (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{activeIndex + 1}/{item.images.length}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.fbPostFooter}>
        <View style={styles.fbRatingBox}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Ionicons key={s} name="star" size={14} color={s <= item.rating ? '#FFD700' : Colors.border} />
          ))}
        </View>

        <View style={styles.fbStatsRow}>
          <View style={styles.fbStatGroup}>
            <View style={styles.fbLikeIconCircle}>
              <Ionicons name="heart" size={10} color={Colors.white} />
            </View>
            <Text style={styles.fbStatText}>{item.likes || 0}</Text>
          </View>
          <Text style={styles.fbStatText}>{t('comments_count', { count: item.comments || 0 })}</Text>
        </View>

        <View style={styles.fbActionDivider} />

        <View style={styles.fbActionRow}>
          <TouchableOpacity style={styles.fbActionBtn} onPress={() => onLike(item.id)}>
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={item.isLiked ? Colors.primary : Colors.text}
            />
            <Text style={[styles.fbActionText, item.isLiked && { color: Colors.primary }]}>
              {t('like')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fbActionBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.text} />
            <Text style={styles.fbActionText}>{t('comment')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fbActionBtn}>
            <Ionicons name="share-outline" size={20} color={Colors.text} />
            <Text style={styles.fbActionText}>{t('share')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fbPostCard: {
    backgroundColor: Colors.white,
    marginBottom: 10,
    paddingVertical: 15,
  },
  fbPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  fbAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F2F5',
  },
  fbHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  fbUserName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  fbTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  fbTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  fbFollowBtn: {
    padding: 8,
  },
  fbActionMenu: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fbMoreBtn: {
    padding: 8,
    marginLeft: 5,
  },
  fbContent: {
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  fbRecipeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  fbRecipeTagIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fbRecipeTagName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 10,
  },
  fbPostImageScroll: {
    width: SCREEN_WIDTH,
  },
  fbPostImage: {
    width: SCREEN_WIDTH,
    height: 350,
    backgroundColor: '#F0F2F5',
  },
  imageBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  fbPostFooter: {
    paddingHorizontal: 15,
    paddingTop: 12,
  },
  fbRatingBox: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  fbStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fbStatGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fbLikeIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  fbStatText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  fbActionDivider: {
    height: 1,
    backgroundColor: '#E4E6EB',
    marginBottom: 8,
  },
  fbActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fbActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  fbActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginLeft: 8,
  },
});

export default FeedItem;
