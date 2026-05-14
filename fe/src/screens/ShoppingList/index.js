import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Share } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useGetShoppingListQuery } from '@redux/api/Recipes';
import { useRoute, useNavigation } from '@react-navigation/native';

const ShoppingListScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = route.params;

  const { data: shoppingData, isLoading } = useGetShoppingListQuery(recipeId);
  const [checkedItems, setCheckedItems] = React.useState({});

  const toggleCheck = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleShare = async () => {
    if (!checklist.length) return;
    
    const listText = checklist
      .map((item, idx) => `${checkedItems[idx] ? '✅' : '⬜️'} ${item.Item}`)
      .join('\n');
    
    const message = `🛒 Danh sách đi chợ cho món: ${recipeTitle}\n\n${listText}\n\nChia sẻ từ Fresh Chef 👨‍🍳`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const recipeTitle = shoppingData?.Data?.RecipeTitle || '';
  const checklist = shoppingData?.Data?.Checklist || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('shopping_list', 'Danh sách đi chợ')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.recipeCard}>
          <Ionicons name="restaurant-outline" size={24} color={Colors.primary} />
          <Text style={styles.recipeTitle}>{recipeTitle}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('items_to_buy', 'Các thứ cần mua')}</Text>
        
        {checklist.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.checkItem}
            onPress={() => toggleCheck(index)}
          >
            <Ionicons 
              name={checkedItems[index] ? "checkbox" : "square-outline"} 
              size={24} 
              color={checkedItems[index] ? Colors.success : Colors.textLight} 
            />
            <Text style={[
              styles.itemText,
              checkedItems[index] && styles.itemTextChecked
            ]}>
              {item.Item}
            </Text>
          </TouchableOpacity>
        ))}

        {checklist.length === 0 && (
          <Text style={styles.emptyText}>{t('no_ingredients_found', 'Không tìm thấy nguyên liệu nào.')}</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social-outline" size={20} color={Colors.white} />
        <Text style={styles.shareButtonText}>{t('share_list', 'Chia sẻ danh sách')}</Text>
      </TouchableOpacity>
    </View>
  );
};

import styles from './styles';

export default ShoppingListScreen;
