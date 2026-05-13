import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import LoginScreen from '@screens/Login';
import RegisterScreen from '@screens/Register';
import HomeScreen from '@screens/Home';
import OnboardingScreen from '@screens/Onboarding';
import PreferenceQuizScreen from '@screens/PreferenceQuiz';

import RecipeDetailScreen from '@screens/RecipeDetail';
import AllRecipesScreen from '@screens/AllRecipes';
import ShoppingListScreen from '@screens/ShoppingList';

import MainTabNavigator from './MainTabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLogged, user } = useSelector((state) => state.auth);
  const hasCompletedSurvey = user?.HasCompletedSurvey;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {!isLogged ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="PreferenceQuiz" component={PreferenceQuizScreen} />
          </>
        ) : (
          // App Stack
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
            <Stack.Screen name="AllRecipes" component={AllRecipesScreen} />
            <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
