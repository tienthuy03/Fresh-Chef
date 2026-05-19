import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Share,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGetMealPlanShoppingListQuery } from '@redux/api/MealPlans';
import { 
  useAddBulkItemsToShoppingListMutation,
  useCreateSavedShoppingListMutation 
} from '@redux/api/ShoppingList';

const SmartShoppingListScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  
  // Retrieve startDate and endDate from route params
  const { startDate, endDate } = route.params || {};

  const { data: shoppingResponse, isLoading, refetch } = useGetMealPlanShoppingListQuery({
    startDate,
    endDate
  });
  
  const [addBulkItems, { isLoading: isSyncing }] = useAddBulkItemsToShoppingListMutation();
  const [createSavedList, { isLoading: isSaving }] = useCreateSavedShoppingListMutation();

  const ingredientsList = shoppingResponse?.Data || [];

  // Local state for toggled checked items
  const [checkedState, setCheckedState] = useState({});
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const toggleCheck = (index) => {
    setCheckedState(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleShare = async () => {
    if (!ingredientsList.length) return;
    
    const listText = ingredientsList
      .map((item, idx) => {
        const isChecked = !!checkedState[idx];
        const statusIcon = isChecked ? '✅' : '⬜️';
        const recipeText = item.recipes && item.recipes.length > 0 ? ` (Món: ${item.recipes.join(', ')})` : '';
        return `${statusIcon} ${item.name}: ${item.quantity}${recipeText}`;
      })
      .join('\n');
    
    const message = `🛒 DANH SÁCH ĐI CHỢ THÔNG MINH\nTuần: ${formatVnDate(startDate)} - ${formatVnDate(endDate)}\n\n${listText}\n\nTổng hợp tự động từ Fresh Chef 👨‍🍳`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleOpenSaveModal = () => {
    if (!ingredientsList.length) {
      Alert.alert(t('notice', 'Thông báo'), 'Giỏ hàng tuần trống, không thể lưu!');
      return;
    }
    const defaultName = `Giỏ chợ tuần ${formatVnDate(startDate)}`;
    setTemplateName(defaultName);
    setIsSaveModalVisible(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert(t('error_title', 'Lỗi'), 'Vui lòng nhập tên cho giỏ hàng');
      return;
    }

    const itemsToSave = ingredientsList.map(item => ({
      name: item.name,
      quantity: item.quantity
    }));

    try {
      await createSavedList({
        name: templateName.trim(),
        items: itemsToSave
      }).unwrap();
      
      setIsSaveModalVisible(false);
      
      Alert.alert(
        t('success_title', 'Thành công'),
        `Đã lưu giỏ hàng "${templateName}" thành mẫu đi chợ riêng biệt thành công! Bạn có thể xem lại bất kỳ lúc nào tại tab "Mẫu đã lưu".`,
        [
          { text: 'OK' }
        ]
      );
    } catch (err) {
      Alert.alert(t('error_title', 'Lỗi'), 'Không thể lưu mẫu đi chợ riêng biệt');
    }
  };

  const handleSyncToGlobal = async () => {
    // Collect all ingredients that are NOT checked off locally
    const itemsToSync = ingredientsList
      .filter((_, idx) => !checkedState[idx])
      .map(item => ({
        name: item.name,
        quantity: item.quantity
      }));

    if (itemsToSync.length === 0) {
      Alert.alert(t('notice', 'Thông báo'), t('all_items_checked', 'Bạn đã gạch bỏ hết nguyên liệu hoặc giỏ hàng trống!'));
      return;
    }

    try {
      await addBulkItems(itemsToSync).unwrap();
      Alert.alert(
        t('success_title', 'Thành công'),
        `Đã đồng bộ ${itemsToSync.length} nguyên liệu vào Giỏ đi chợ chính của bạn!`,
        [
          {
            text: 'Ở lại trang',
            style: 'cancel'
          },
          {
            text: 'Xem giỏ hàng chính',
            onPress: () => {
              navigation.navigate('Main', { screen: 'Cookbook', params: { activeTab: 'Shopping' } });
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert(t('error_title', 'Lỗi'), 'Không thể đồng bộ vào Giỏ đi chợ chính');
    }
  };

  const formatVnDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tổng hợp nguyên liệu tuần...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ Chợ Thông Minh Tuần</Text>
        
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.saveTemplateHeaderBtn} onPress={handleOpenSaveModal}>
            <Ionicons name="bookmark-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
            <Ionicons name="refresh" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly range card */}
        <View style={styles.rangeCard}>
          <View style={styles.rangeIconBg}>
            <Ionicons name="sparkles" size={20} color={Colors.white} />
          </View>
          <View style={styles.rangeTextContainer}>
            <Text style={styles.rangeLabel}>Thực đơn tuần từ</Text>
            <Text style={styles.rangeDates}>
              {formatVnDate(startDate)} đến {formatVnDate(endDate)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nguyên liệu tổng hợp ({ingredientsList.length})</Text>
          <Text style={styles.sectionSubtitle}>Đã gộp trùng & cộng dồn định lượng</Text>
        </View>
        
        {ingredientsList.map((item, index) => {
          const isChecked = !!checkedState[index];
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.checkItem, isChecked && styles.checkItemChecked]}
              onPress={() => toggleCheck(index)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isChecked ? "checkbox" : "square-outline"} 
                size={24} 
                color={isChecked ? Colors.success : Colors.textLight} 
              />
              <View style={styles.itemInfo}>
                <View style={styles.itemNameRow}>
                  <Text style={[
                    styles.itemName,
                    isChecked && styles.itemTextChecked
                  ]}>
                    {item.name}
                  </Text>
                  {item.quantity ? (
                    <Text style={[
                      styles.itemQuantity,
                      isChecked && styles.itemTextChecked
                    ]}>
                      {item.quantity}
                    </Text>
                  ) : null}
                </View>
                
                {/* Source recipe badges */}
                {item.recipes && item.recipes.length > 0 ? (
                  <View style={styles.badgeContainer}>
                    {item.recipes.map((rec, rIdx) => (
                      <View key={rIdx} style={styles.recipeBadge}>
                        <Ionicons name="restaurant-outline" size={10} color={Colors.primary} style={{ marginRight: 3 }} />
                        <Text style={styles.recipeBadgeText} numberOfLines={1}>
                          {rec}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}

        {ingredientsList.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>Chưa có nguyên liệu nào.</Text>
            <Text style={styles.emptySubtext}>Hãy thêm món vào Kế hoạch nấu ăn để tự động tạo giỏ chợ thông minh!</Text>
          </View>
        )}
      </ScrollView>

      {/* Premium Actions Footer */}
      {ingredientsList.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Chia sẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleSyncToGlobal}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={20} color={Colors.white} />
                <Text style={styles.primaryButtonText}>Lên giỏ chợ chính</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Save Template Modal */}
      <Modal
        visible={isSaveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSaveModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSaveModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cất Giữ Giỏ Hàng Riêng Biệt 💾</Text>
                <Text style={styles.modalSubtitle}>
                  Lưu các nguyên liệu này thành một giỏ hàng độc lập để bạn có thể xem lại hoặc sử dụng bất kỳ khi nào mà không lo bị thay đổi khi thêm món khác.
                </Text>
                
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tên mẫu đi chợ gợi nhớ..."
                  value={templateName}
                  onChangeText={setTemplateName}
                  placeholderTextColor="#999"
                />

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsSaveModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveTemplate}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>Xác nhận lưu</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: Colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    padding: 5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveTemplateHeaderBtn: {
    padding: 5,
    marginRight: 12,
  },
  refreshButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  rangeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  rangeIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rangeTextContainer: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginBottom: 2,
  },
  rangeDates: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionHeaderRow: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  checkItemChecked: {
    backgroundColor: '#F8F9FA',
    borderColor: '#EFEFEF',
    opacity: 0.7,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  recipeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 4,
    maxWidth: 120,
  },
  recipeBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.primary,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '32%',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '64%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
  },
  cancelButton: {
    backgroundColor: '#F1F3F5',
  },
  cancelButtonText: {
    color: '#495057',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SmartShoppingListScreen;
