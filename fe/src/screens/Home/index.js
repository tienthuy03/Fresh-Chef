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
      title: t('connection_lost'),
      content: t('connection_lost_msg'),
    }));
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome')}</Text>

      <TouchableOpacity style={styles.button} onPress={handleTestLoading}>
        <Text style={styles.buttonText}>{t('test_loading')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.error }]} onPress={handleTestError}>
        <Text style={styles.buttonText}>{t('test_error')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.secondary }]} onPress={toggleLanguage}>
        <Text style={styles.buttonText}>{t('switch_language')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
