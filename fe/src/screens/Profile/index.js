import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from '@redux/api/Auth';
import { useDispatch } from 'react-redux';
import { logOut } from '@redux/slices/authSlice';
import SectionHeader from '@components/GlobalUI/SectionHeader';
import PrimaryButton from '@components/GlobalUI/PrimaryButton';
import { launchImageLibrary } from 'react-native-image-picker';
import { BASE_URL } from '@constants/Config';



const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: profileData, isLoading, refetch } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  
  const user = profileData?.Data || {};
  const stats = user.Stats || { Followers: 0, Following: 0, Recipes: 0 };

  // Modals visibility
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({ fullName: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const handleLogout = () => {
    dispatch(logOut());
  };

  const handleEditAvatar = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'avatar.jpg',
      });

      try {
        await updateProfile(formData).unwrap();
        refetch();
        Alert.alert(t('success'), t('avatar_updated_success', 'Cập nhật ảnh đại diện thành công!'));
      } catch (err) {
        console.error('Avatar update failed', err);
        Alert.alert(t('error'), t('avatar_updated_failed', 'Cập nhật ảnh đại diện thất bại'));
      }
    }
  };

  const openEditModal = () => {
    setEditForm({
      fullName: user.fullName || '',
      bio: user.bio || '',
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('fullName', editForm.fullName);
    formData.append('bio', editForm.bio);

    try {
      await updateProfile(formData).unwrap();
      refetch();
      setIsEditModalVisible(false);
      Alert.alert(t('success'), t('profile_updated_success', 'Cập nhật hồ sơ thành công!'));
    } catch (err) {
      Alert.alert(t('error'), t('profile_updated_failed', 'Cập nhật hồ sơ thất bại'));
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert(t('error'), t('passwords_not_match', 'Mật khẩu mới không khớp'));
      return;
    }

    try {
      await changePassword({
        username: user.username,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      }).unwrap();
      
      setIsPasswordModalVisible(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert(t('success'), t('password_changed_success', 'Đổi mật khẩu thành công!'));
    } catch (err) {
      Alert.alert(t('error'), err.data?.Message || t('password_changed_failed', 'Đổi mật khẩu thất bại'));
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const MenuItem = ({ icon, title, subtitle, color = Colors.text, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.border} />
    </TouchableOpacity>
  );

  const getAvatarUri = () => {
    if (!user.avatar) return `https://i.pravatar.cc/150?u=${user.id}`;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${BASE_URL}${user.avatar}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {isUpdating ? (
                <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
                   <ActivityIndicator color={Colors.primary} />
                </View>
              ) : (
                <Image 
                  source={{ uri: getAvatarUri() }} 
                  style={styles.avatar} 
                />
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditAvatar} disabled={isUpdating}>
                <Ionicons name="camera" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user.fullName || user.username}</Text>
            <Text style={styles.userEmail}>{user.email || 'No email provided'}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.Recipes}</Text>
                <Text style={styles.statLabel}>Recipes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.Followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.Following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            <PrimaryButton 
              title="Chỉnh sửa hồ sơ" 
              onPress={openEditModal} 
              style={styles.editProfileButton}
              textStyle={styles.editProfileButtonText}
            />
          </View>
        </View>

        {/* Content Sections */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <SectionHeader title="Sở thích nấu nướng" style={{ marginBottom: 0 }} />
            <TouchableOpacity onPress={() => navigation.navigate('PreferenceQuiz')}>
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
          {user.preferences?.diets?.length > 0 ? (
            <MenuItem 
              icon="restaurant-outline" 
              title="Chế độ ăn uống" 
              subtitle={user.preferences.diets.join(', ')} 
              color={Colors.primary} 
            />
          ) : (
             <Text style={styles.emptyText}>Chưa thiết lập chế độ ăn</Text>
          )}
          {user.preferences?.householdSize ? (
            <MenuItem 
              icon="people-outline" 
              title="Khẩu phần gia đình" 
              subtitle={`${user.preferences.householdSize} người`} 
              color="#4ECDC4" 
            />
          ) : null}
          {user.preferences?.timeLimit ? (
            <MenuItem 
              icon="time-outline" 
              title="Thời gian nấu nướng" 
              subtitle={`${user.preferences.timeLimit}`} 
              color="#FF9F43" 
            />
          ) : null}
        </View>

        {user.bio && (
          <View style={styles.section}>
            <SectionHeader title="Giới thiệu" />
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Tài khoản" />
          <MenuItem 
            icon="person-outline" 
            title="Thông tin cá nhân" 
            onPress={openEditModal}
          />
          <MenuItem 
            icon="shield-checkmark-outline" 
            title="Đổi mật khẩu" 
            onPress={() => setIsPasswordModalVisible(true)}
          />
        </View>

        <PrimaryButton 
          title="Đăng xuất" 
          onPress={handleLogout} 
          style={styles.logoutButton}
          textStyle={styles.logoutText}
          iconLeft={<Ionicons name="log-out-outline" size={22} color={Colors.error} />}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput 
                style={styles.textInput}
                value={editForm.fullName}
                onChangeText={(v) => setEditForm(prev => ({ ...prev, fullName: v }))}
                placeholder="Nhập họ tên"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới thiệu (Bio)</Text>
              <TextInput 
                style={[styles.textInput, { height: 100 }]}
                value={editForm.bio}
                onChangeText={(v) => setEditForm(prev => ({ ...prev, bio: v }))}
                placeholder="Viết vài dòng giới thiệu về bản thân..."
                multiline
              />
            </View>

            <PrimaryButton 
              title="Cập nhật" 
              onPress={handleUpdateProfile}
              isLoading={isUpdating}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={isPasswordModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
              <TextInput 
                style={styles.textInput}
                value={passwordForm.oldPassword}
                onChangeText={(v) => setPasswordForm(prev => ({ ...prev, oldPassword: v }))}
                placeholder="********"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <TextInput 
                style={styles.textInput}
                value={passwordForm.newPassword}
                onChangeText={(v) => setPasswordForm(prev => ({ ...prev, newPassword: v }))}
                placeholder="********"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
              <TextInput 
                style={styles.textInput}
                value={passwordForm.confirmPassword}
                onChangeText={(v) => setPasswordForm(prev => ({ ...prev, confirmPassword: v }))}
                placeholder="********"
                secureTextEntry
              />
            </View>

            <PrimaryButton 
              title="Đổi mật khẩu" 
              onPress={handleChangePassword}
              isLoading={isChangingPassword}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

import styles from './styles';

export default ProfileScreen;
