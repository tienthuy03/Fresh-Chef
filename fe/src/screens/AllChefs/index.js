import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useGetUsersQuery, useFollowUserMutation } from '@redux/api/Community';
import { BASE_URL } from '@constants/Config';
import { Colors } from '@constants/Colors';
import styles from './styles';

const AllChefsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data: usersData, isLoading, refetch } = useGetUsersQuery();
  const [followUser] = useFollowUserMutation();
  const [searchQuery, setSearchQuery] = useState('');

  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  };

  const filteredUsers = useMemo(() => {
    if (!usersData?.Data) return [];
    if (!searchQuery) return usersData.Data;
    
    const query = removeAccents(searchQuery);
    return usersData.Data.filter(user => {
      const name = removeAccents(user.fullName || user.username);
      return name.includes(query);
    });
  }, [usersData, searchQuery]);

  const handleFollow = async (userId) => {
    try {
      await followUser(userId).unwrap();
    } catch (err) {
      console.log('Follow error:', err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <Image 
        source={{ 
          uri: item.avatar 
            ? (item.avatar.startsWith('http') ? item.avatar : BASE_URL + item.avatar)
            : `https://i.pravatar.cc/150?u=${item.id}` 
        }} 
        style={styles.userAvatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userFullName} numberOfLines={1}>
          {item.fullName || item.username}
        </Text>
        <Text style={styles.userFollowers}>
          {item.followersCount || 0} {t('followers', 'người theo dõi')}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.followButton, item.isFollowing && styles.followingButton]} 
        onPress={() => handleFollow(item.id)}
      >
        <Text style={[styles.followButtonText, item.isFollowing && styles.followingButtonText]}>
          {item.isFollowing ? t('following_status', 'Đã kết nối') : t('connect', 'Kết nối')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('suggested_chefs', 'Đầu bếp gợi ý')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search_chef', 'Tìm kiếm đầu bếp...')}
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color={Colors.border} />
          <Text style={styles.emptyText}>{t('no_chefs_found', 'Không tìm thấy đầu bếp nào.')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
};

export default AllChefsScreen;
