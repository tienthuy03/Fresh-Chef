import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { Platform, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import HomeScreen from '@screens/Home';
import ExploreScreen from '@screens/Explore';
import CommunityScreen from '@screens/Community';
import CookbookScreen from '@screens/Cookbook';
import ProfileScreen from '@screens/Profile';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Cookbook') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tab_home') }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: t('tab_explore') }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: t('tab_community') }} />
      <Tab.Screen name="Cookbook" component={CookbookScreen} options={{ tabBarLabel: t('tab_cookbook') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tab_profile') }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute', // Makes it float slightly
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 0,
  },
});

export default MainTabNavigator;
