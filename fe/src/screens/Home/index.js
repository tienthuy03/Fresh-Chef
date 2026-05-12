import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading, showError } from '@redux/slices/uiSlice';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/Colors';
import styles from './styles';

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const handleTestLoading = () => {
    dispatch(showLoading());
    setTimeout(() => {
      dispatch(hideLoading());
    }, 2000);
  };

  const handleTestError = () => {
    dispatch(showError({ 
      title: 'Connection Lost', 
      content: 'Please check your internet connection and try again.' 
    }));
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome')}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleTestLoading}>
        <Text style={styles.buttonText}>Test Loading (2s)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.error }]} onPress={handleTestError}>
        <Text style={styles.buttonText}>Test Error</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.secondary }]} onPress={toggleLanguage}>
        <Text style={styles.buttonText}>
          {i18n.language === 'vi' ? 'Switch to English' : 'Đổi sang Tiếng Việt'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
