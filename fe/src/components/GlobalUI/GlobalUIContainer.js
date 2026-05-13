import React from 'react';
import { View, ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { hideAlert } from '../../redux/slices/uiSlice';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Spacing';
import { FontSize } from '../../constants/Typography';
import { useTranslation } from 'react-i18next';

const GlobalUIContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoading, alert } = useSelector((state) => state.ui);

  const isVisible = isLoading || alert.visible;

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.overlay}>
        {isLoading ? (
          <View style={styles.card}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={[
              styles.title, 
              alert.type === 'success' && { color: Colors.success },
              alert.type === 'error' && { color: Colors.error }
            ]}>
              {alert.title || (alert.type === 'error' ? t('error_title') : t('success_title'))}
            </Text>
            <Text style={styles.content}>{alert.content}</Text>
            <TouchableOpacity 
              style={[
                styles.button,
                alert.type === 'success' && { backgroundColor: Colors.success },
                alert.type === 'error' && { backgroundColor: Colors.error }
              ]} 
              onPress={() => dispatch(hideAlert())}
            >
              <Text style={styles.buttonText}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.text,
    fontSize: FontSize.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  content: {
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.round,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: FontSize.md,
  },
});

export default GlobalUIContainer;
