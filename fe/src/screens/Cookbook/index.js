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
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import RecipeListItem from '@components/Recipe/RecipeListItem';
import SectionHeader from '@components/GlobalUI/SectionHeader';
import MealPlanSection from './MealPlanSection';
import {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
  useGetGlobalShoppingListQuery,
  useToggleShoppingItemMutation,
  useClearShoppingListMutation,
} from '@redux/api/Recipes';
import {
  useGetSavedShoppingListsQuery,
  useDeleteSavedShoppingListMutation,
  useImportSavedShoppingListMutation,
} from '@redux/api/ShoppingList';

const CookbookScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  
  const initialTab = route.params?.activeTab || 'Saved';
  const [activeTab, setActiveTab] = useState(initialTab);

  React.useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  const { data: favoritesData, isLoading: isFavLoading } =
    useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const { data: shoppingData, isLoading: isShopLoading } =
    useGetGlobalShoppingListQuery();
  const [toggleShoppingItem] = useToggleShoppingItemMutation();
  const [clearShoppingList] = useClearShoppingListMutation();

  // Reusable custom lists queries
  const { data: savedCartsResponse, isLoading: isCartsLoading } =
    useGetSavedShoppingListsQuery(undefined, {
      skip: activeTab !== 'Templates'
    });
  const [deleteSavedCart] = useDeleteSavedShoppingListMutation();
  const [importSavedCart] = useImportSavedShoppingListMutation();

  const savedRecipes = favoritesData?.Data || [];
  const shoppingList = shoppingData?.Data || [];
  const savedCartsList = savedCartsResponse?.Data || [];

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

  const handleImportCart = async (id, name) => {
    try {
      await importSavedCart(id).unwrap();
      Alert.alert(
        t('success_title', 'Thành công'),
        `Đã nhập toàn bộ nguyên liệu từ mẫu "${name}" vào Giỏ hàng đi chợ của bạn!`,
        [
          {
            text: 'Đóng',
            style: 'cancel'
          },
          {
            text: 'Xem giỏ hàng chính',
            onPress: () => setActiveTab('Shopping')
          }
        ]
      );
    } catch (err) {
      Alert.alert(t('error_title', 'Lỗi'), 'Không thể nhập nguyên liệu vào giỏ chợ');
    }
  };

  const handleDeleteCart = (id, name) => {
    Alert.alert(
      t('confirm_delete', 'Xác nhận xoá'),
      `Bạn chắc chắn muốn xoá mẫu đi chợ "${name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xoá', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedCart(id).unwrap();
            } catch (err) {
              Alert.alert(t('error_title', 'Lỗi'), 'Không thể xoá mẫu đi chợ');
            }
          }
        }
      ]
    );
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

  const renderSavedCartItem = ({ item }) => {
    const previewText = item.items && item.items.length > 0
      ? item.items.slice(0, 4).map(i => i.name).join(', ') + (item.items.length > 4 ? '...' : '')
      : 'Không có nguyên liệu';

    return (
      <View style={styles.cartTemplateCard}>
        <View style={styles.cartTemplateInfo}>
          <Text style={styles.cartTemplateName}>{item.name}</Text>
          <Text style={styles.cartTemplateCount}>
            {item.items ? item.items.length : 0} nguyên liệu
          </Text>
          <Text style={styles.cartTemplatePreview} numberOfLines={1}>
            {previewText}
          </Text>
        </View>

        <View style={styles.cartTemplateActions}>
          <TouchableOpacity 
            style={styles.cartTemplateUseBtn}
            onPress={() => handleImportCart(item.id, item.name)}
          >
            <Ionicons name="cart-outline" size={15} color={Colors.white} />
            <Text style={styles.cartTemplateUseBtnText}>Sử dụng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cartTemplateDeleteBtn}
            onPress={() => handleDeleteCart(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={18} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
            Giỏ chợ chính
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Templates' && styles.activeTab]}
          onPress={() => setActiveTab('Templates')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Templates' && styles.activeTabText,
            ]}
          >
            Mẫu đã lưu
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
              ListHeaderComponent={() => <MealPlanSection />}
            />
          )
        ) : activeTab === 'Shopping' ? (
          isShopLoading ? (
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
                    title="Giỏ đi chợ hiện tại" 
                    onActionPress={handleClearAll}
                    actionText={t('clear_all')}
                  />
                </View>
              )}
            />
          )
        ) : isCartsLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={savedCartsList}
            renderItem={renderSavedCartItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={() => (
              <View style={styles.shoppingHeader}>
                <SectionHeader 
                  title="Các giỏ hàng đã cất giữ" 
                />
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                <Ionicons name="bookmark-outline" size={48} color={Colors.textLight} />
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.text, marginTop: 15 }}>
                  Chưa có giỏ hàng riêng biệt
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 18, paddingHorizontal: 20 }}>
                  Hãy bấm biểu tượng lưu (bookmark) trong màn hình Đi chợ tuần để cất giữ thành một giỏ nguyên liệu độc lập nhé!
                </Text>
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
