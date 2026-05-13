import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform, FlatList, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useGetFeedQuery, useFollowUserMutation } from '@redux/api/Community';


const FeedItem = ({ item, onFollow, isFollowing }) => (
  <View style={styles.feedCard}>
    <View style={styles.feedHeader}>
      <Image source={{ uri: item.User?.avatar || `https://i.pravatar.cc/150?u=${item.UserId}` }} style={styles.avatar} />
      <View style={styles.headerInfo}>
        <Text style={styles.userName}>{item.User?.fullName || item.User?.username}</Text>
        <Text style={styles.feedTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity onPress={() => onFollow(item.UserId)}>
        <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Follow</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.feedContent}>{item.content}</Text>
    
    <TouchableOpacity style={styles.recipeTag}>
      <Ionicons name="restaurant-outline" size={14} color={Colors.primary} />
      <Text style={styles.recipeTagName}>{item.Recipe?.title}</Text>
    </TouchableOpacity>

    {item.images && JSON.parse(item.images).length > 0 && (
      <Image source={{ uri: `http://localhost:3000${JSON.parse(item.images)[0]}` }} style={styles.feedImage} />
    )}

    <View style={styles.feedFooter}>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Ionicons key={s} name="star" size={16} color={s <= item.rating ? '#FFD700' : Colors.border} />
        ))}
      </View>
      
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem}>
          <Ionicons name="heart-outline" size={20} color={Colors.text} />
          <Text style={styles.statText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.text} />
          <Text style={styles.statText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Ionicons name="share-social-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const CommunityScreen = () => {
  const { t } = useTranslation();
  const { data: feedData, isLoading, refetch } = useGetFeedQuery();
  const [followUser] = useFollowUserMutation();

  const handleFollow = async (userId) => {
    try {
      await followUser(userId).unwrap();
    } catch (err) {
      console.log('Follow error:', err);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('community')}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={feedData?.Data || []}
        renderItem={({ item }) => <FeedItem item={item} onFollow={handleFollow} />}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Discover</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  feedList: {
    paddingBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.white,
  },
  feedCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 20,
    padding: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  feedTime: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  feedContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  recipeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 12,
  },
  recipeTagName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  feedImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 12,
  },
  feedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  statText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 5,
    fontWeight: '500',
  },
});

export default CommunityScreen;
