import React from 'react';
import { View, ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { hideError } from '../../redux/slices/uiSlice';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Spacing';
import { FontSize } from '../../constants/Typography';
import { useTranslation } from 'react-i18next';

const GlobalUIContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.ui);

  return (
    <>
      {/* Loading Modal */}
      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal transparent visible={error.visible} animationType="slide">
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{error.title || t('error_title')}</Text>
            <Text style={styles.errorContent}>{error.content}</Text>
            <TouchableOpacity 
              style={styles.errorButton} 
              onPress={() => dispatch(hideError())}
            >
              <Text style={styles.errorButtonText}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.text,
    fontSize: FontSize.md,
  },
  errorOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    width: '100%',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  errorContent: {
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.round,
  },
  errorButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: FontSize.md,
  },
});

export default GlobalUIContainer;
