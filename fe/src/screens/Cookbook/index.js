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
            Saved Recipes
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
            Shopping List
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
                  <Text style={styles.subTitle}>My Collections</Text>
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
                      <Text style={styles.collectionName}>Favorites</Text>
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
                      <Text style={styles.collectionName}>Healthy</Text>
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
                      <Text style={styles.collectionName}>Spicy</Text>
                    </TouchableOpacity>
                  </ScrollView>
                  <Text style={[styles.subTitle, { marginTop: 20 }]}>
                    All Saved
                  </Text>
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
                <Text style={styles.subTitle}>Items to buy</Text>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => handleClearAll()}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      <View style={{ height: 100 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    marginRight: 30,
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  collectionsList: {
    marginBottom: 10,
  },
  collectionCard: {
    alignItems: 'center',
    marginRight: 25,
  },
  collectionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  recipeListItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeListImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  recipeListInfo: {
    flex: 1,
    marginLeft: 15,
  },
  recipeListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  recipeListMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeListMetaText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  removeButton: {
    padding: 10,
  },
  shoppingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButtonText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  shoppingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  shoppingName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  shoppingQuantity: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
});

export default CookbookScreen;
