import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';

const SectionHeader = ({ title, onActionPress, actionText, actionComponent }) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          {actionComponent ? actionComponent : (
            <Text style={styles.actionText}>
              {actionText || t('see_all', 'Xem tất cả')}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default SectionHeader;
