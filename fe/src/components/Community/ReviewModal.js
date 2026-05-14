import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import PrimaryButton from '@components/GlobalUI/PrimaryButton';
import { BASE_URL } from '@constants/Config';



const ReviewModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  isLoading, 
  initialRecipe = null, 
  recipes = [], 
  initialData = null 
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setContent(initialData.content || '');
        setRating(initialData.rating || 5);
        setSelectedRecipeId(initialData.RecipeId || null);
        setExistingImages(initialData.images || []);
        setSelectedImages([]);
      } else {
        setContent('');
        setRating(5);
        setSelectedRecipeId(initialRecipe?.id || null);
        setSelectedImages([]);
        setExistingImages([]);
      }
    }
  }, [visible, initialData, initialRecipe]);

  const filteredRecipes = recipes?.filter(r => 
    r.title.toLowerCase().includes(recipeSearch.toLowerCase())
  ).slice(0, 10);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
    });

    if (result.assets) {
      setSelectedImages(result.assets);
    }
  };

  const handleSubmit = () => {
    const data = {
      content,
      rating,
      recipeId: selectedRecipeId,
      selectedImages,
      existingImages
    };
    onSubmit(data);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialData ? t('edit') : t('share_result')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {initialRecipe ? (
               <Text style={styles.modalRecipeTitle}>{initialRecipe.title}</Text>
            ) : !initialData && (
              <>
                <Text style={styles.inputLabel}>{t('choose_recipe')}</Text>
                <TextInput
                  style={styles.searchMiniInput}
                  placeholder={t('search_recipe_placeholder')}
                  value={recipeSearch}
                  onChangeText={setRecipeSearch}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipePicker}>
                  {filteredRecipes?.map((recipe) => (
                    <TouchableOpacity 
                      key={recipe.id} 
                      style={[
                        styles.recipeOption, 
                        selectedRecipeId === recipe.id && styles.selectedRecipeOption
                      ]}
                      onPress={() => setSelectedRecipeId(recipe.id)}
                    >
                      <Image source={{ uri: recipe.image_url }} style={styles.recipeOptionImage} />
                      <Text style={[
                        styles.recipeOptionText,
                        selectedRecipeId === recipe.id && styles.selectedRecipeOptionText
                      ]} numberOfLines={1}>
                        {recipe.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.inputLabel}>{t('rating')}</Text>
            <View style={styles.ratingPicker}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons name="star" size={36} color={s <= rating ? '#FFD700' : Colors.border} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t('experience_placeholder')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('experience_placeholder')}
              multiline
              numberOfLines={4}
              value={content}
              onChangeText={setContent}
            />

            <Text style={styles.inputLabel}>{t('photos')}</Text>
            <View style={styles.imagePickerRow}>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
                <Ionicons name="camera" size={24} color={Colors.primary} />
                <Text style={styles.imagePickerBtnText}>{t('add_photo')}</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {existingImages.map((img, index) => (
                  <View key={`existing-${index}`} style={styles.previewImageContainer}>
                    <Image source={{ uri: `${BASE_URL}${img}` }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageBtn} 
                      onPress={() => setExistingImages(existingImages.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImages.map((img, index) => (
                  <View key={index} style={styles.previewImageContainer}>
                    <Image source={{ uri: img.uri }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageBtn} 
                      onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            <PrimaryButton 
              title={t('post_to_community')}
              onPress={handleSubmit}
              isLoading={isLoading}
              style={styles.postButton}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalRecipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  searchMiniInput: {
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 10,
  },
  recipePicker: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  recipeOption: {
    width: 120,
    marginRight: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
    alignItems: 'center',
  },
  selectedRecipeOption: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  recipeOptionImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginBottom: 5,
  },
  recipeOptionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  selectedRecipeOptionText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  ratingPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: Colors.text,
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  imagePickerBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  imagePickerBtnText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 5,
  },
  previewImageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  postButton: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  postButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReviewModal;
