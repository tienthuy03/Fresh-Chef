import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import LoginScreen from '@screens/Login';
import RegisterScreen from '@screens/Register';
import HomeScreen from '@screens/Home';
import OnboardingScreen from '@screens/Onboarding';
import PreferenceQuizScreen from '@screens/PreferenceQuiz';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLogged } = useSelector((state) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Onboarding"
        screenOptions={{ headerShown: false }}
      >
        {!isLogged ? (
          // Auth Stack
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="PreferenceQuiz" component={PreferenceQuizScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // App Stack
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
