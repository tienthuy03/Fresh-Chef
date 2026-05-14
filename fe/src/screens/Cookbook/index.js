import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import RecipeListItem from '@components/Recipe/RecipeListItem';
import SectionHeader from '@components/GlobalUI/SectionHeader';
import {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
  useGetGlobalShoppingListQuery,
  useToggleShoppingItemMutation,
  useClearShoppingListMutation,
} from '@redux/api/Recipes';

const CookbookScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Saved');

  const { data: favoritesData, isLoading: isFavLoading } =
    useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const { data: shoppingData, isLoading: isShopLoading } =
    useGetGlobalShoppingListQuery();
  const [toggleShoppingItem] = useToggleShoppingItemMutation();
  const [clearShoppingList] = useClearShoppingListMutation();

  const savedRecipes = favoritesData?.Data || [];
  const shoppingList = shoppingData?.Data || [];

  const handleToggleFavorite = async id => {
    try {
      await toggleFavorite(id).unwrap();
    } catch (err) {
      console.log('Toggle fav error:', err);
    }
  };

  const handleToggleShopping = async id => {
    try {
      await toggleShoppingItem(id).unwrap();
    } catch (err) {
      console.log('Toggle shop error:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearShoppingList().unwrap();
    } catch (err) {
      console.log('Clear shop error:', err);
    }
  };

  const renderSavedItem = ({ item }) => (
    <RecipeListItem
      item={item}
      isFavorited={true}
      onFavoritePress={() => handleToggleFavorite(item.id)}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    />
  );

  const renderShoppingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.shoppingItem}
      onPress={() => handleToggleShopping(item.id)}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && (
          <Ionicons name="checkmark" size={16} color={Colors.white} />
        )}
      </View>
      <View style={styles.shoppingInfo}>
        <Text
          style={[
            styles.shoppingName,
            item.checked && styles.textStrikethrough,
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.shoppingQuantity}>{item.quantity}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('cookbook')}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Saved' && styles.activeTab]}
          onPress={() => setActiveTab('Saved')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Saved' && styles.activeTabText,
            ]}
          >
            {t('saved_recipes')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Shopping' && styles.activeTab]}
          onPress={() => setActiveTab('Shopping')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Shopping' && styles.activeTabText,
            ]}
          >
            {t('shopping_list')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'Saved' ? (
          isFavLoading ? (
            <ActivityIndicator
              color={Colors.primary}
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlatList
              data={savedRecipes}
              renderItem={renderSavedItem}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={() => (
                <View style={styles.collectionsSection}>
                  <SectionHeader title={t('my_collections')} />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.collectionsList}
                  >
                    <TouchableOpacity style={styles.collectionCard}>
                      <View
                        style={[
                          styles.collectionIcon,
                          { backgroundColor: '#FFE66D' },
                        ]}
                      >
                        <Ionicons name="star" size={24} color="#F39C12" />
                      </View>
                      <Text style={styles.collectionName}>{t('favorites')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.collectionCard}>
                      <View
                        style={[
                          styles.collectionIcon,
                          { backgroundColor: '#4ECDC4' },
                        ]}
                      >
                        <Ionicons name="leaf" size={24} color="#16A085" />
                      </View>
                      <Text style={styles.collectionName}>{t('healthy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.collectionCard}>
                      <View
                        style={[
                          styles.collectionIcon,
                          { backgroundColor: '#FF6B6B' },
                        ]}
                      >
                        <Ionicons name="flame" size={24} color="#C0392B" />
                      </View>
                      <Text style={styles.collectionName}>{t('spicy')}</Text>
                    </TouchableOpacity>
                  </ScrollView>
                  <SectionHeader title={t('all_saved')} />
                </View>
              )}
            />
          )
        ) : isShopLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={shoppingList}
            renderItem={renderShoppingItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={() => (
              <View style={styles.shoppingHeader}>
                <SectionHeader 
                  title={t('shopping_list')} 
                  onActionPress={handleClearAll}
                  actionText={t('clear_all')}
                />
              </View>
            )}
          />
        )}
      </View>

      <View style={{ height: 100 }} />
    </View>
  );
};

import styles from './styles';

export default CookbookScreen;
