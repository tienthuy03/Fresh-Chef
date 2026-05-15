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
import { showLoading, hideLoading, showError } from '@redux/slices/uiSlice';
import { setCredentials } from '@redux/slices/authSlice';
import { useLoginMutation } from '@redux/api/Auth';
import { useTranslation } from 'react-i18next';
import styles from './styles';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loginTrigger] = useLoginMutation();
  const [username, setUsername] = useState('d');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      dispatch(showError({ title: t('error_title'), content: t('missing_fields') }));
      return;
    }

    try {
      dispatch(showLoading());
      const response = await loginTrigger({ username, password }).unwrap();
      
      if (response.Success) {
        dispatch(setCredentials({
          user: response.Data.User,
          token: response.Data.Token || response.Data.token,
          refreshToken: response.Data.RefreshToken || response.Data.refreshToken
        }));
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>{t('app_name')}</Text>
          <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('username')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('username_placeholder')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>{t('login')}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('no_account')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>{t('register_now')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
