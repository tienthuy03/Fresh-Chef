import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';

const CommunityScreen = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('community_title')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { fontSize: 24, color: Colors.text, fontWeight: 'bold' },
});

export default CommunityScreen;
