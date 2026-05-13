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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Thêm padding để không bị nút "Chia sẻ" che mất
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  itemText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.textLight,
  },
  shareButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  }
});

export default ShoppingListScreen;
