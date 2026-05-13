import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading, showError, showAlert } from '@redux/slices/uiSlice';
import { useRegisterMutation } from '@redux/api/Auth';
import { useTranslation } from 'react-i18next';
import styles from './styles';

const RegisterScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [registerTrigger] = useRegisterMutation();
  const preferences = route.params?.preferences || null;
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const { username, email, fullName, password } = formData;

    if (!username || !password) {
      dispatch(showError({ title: t('error_title'), content: t('missing_fields') }));
      return;
    }

    try {
      dispatch(showLoading());
      const response = await registerTrigger({ 
        username, 
        email, 
        fullName, 
        password,
        preferences // Pass preferences collected from quiz
      }).unwrap();
      
      if (response.Success) {
        dispatch(showAlert({ 
          title: t('success_title'), 
          content: t('register_success_msg'),
          type: 'success'
        }));
        navigation.navigate('Login');
      } else {
        dispatch(showError({ title: t('error_title'), content: response.Message }));
      }
    } catch (err) {
      dispatch(showError({ 
        title: t('error_title'), 
        content: err.data?.Message || t('server_error') 
      }));
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('create_account')}</Text>
          <Text style={styles.subtitle}>{t('register_subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('full_name')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('full_name_placeholder')}
              value={formData.fullName}
              onChangeText={(v) => handleChange('fullName', v)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('username')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('username_placeholder')}
              value={formData.username}
              onChangeText={(v) => handleChange('username', v)}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('email_placeholder')}
              value={formData.email}
              onChangeText={(v) => handleChange('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('password_placeholder')}
              value={formData.password}
              onChangeText={(v) => handleChange('password', v)}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>{t('register')}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('already_have_account')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>{t('login_now')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
