import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useGetMeQuery } from '@redux/api/Auth';
import { useDispatch } from 'react-redux';
import { logOut } from '@redux/slices/authSlice';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: profileData, isLoading } = useGetMeQuery();
  
  const user = profileData?.Data || {};
  const stats = user.Stats || { Followers: 0, Following: 0, Recipes: 0 };

  const handleLogout = () => {
    dispatch(logOut());
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const MenuItem = ({ icon, title, subtitle, color = Colors.text }) => (
    <TouchableOpacity style={styles.menuItem}>
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
              <Image 
                source={{ uri: user.avatar || `https://i.pravatar.cc/150?u=${user.id}` }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.editAvatarButton}>
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

            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <MenuItem 
            icon="restaurant-outline" 
            title="Dietary Restrictions" 
            subtitle={user.preferences?.diets?.join(', ') || 'None'} 
            color={Colors.primary} 
          />
          <MenuItem 
            icon="heart-outline" 
            title="Favorite Cuisines" 
            subtitle="Italian, Japanese" 
            color="#4ECDC4" 
          />
          <MenuItem 
            icon="notifications-outline" 
            title="Notifications" 
            subtitle="Daily recipe alerts on" 
            color="#FFE66D" 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem icon="person-outline" title="Personal Information" />
          <MenuItem icon="shield-checkmark-outline" title="Security & Privacy" />
          <MenuItem icon="help-circle-outline" title="Help & Support" />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.background,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 25,
    width: '80%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  editProfileButton: {
    marginTop: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 118, 117, 0.1)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.error,
    marginLeft: 10,
  },
});

export default ProfileScreen;
