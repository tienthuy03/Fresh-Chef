import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';

const RecipeCard = ({ item, isFavorited, onFavoritePress, onPress }) => {
  return (
    <TouchableOpacity style={styles.recipeCard} onPress={onPress}>
      <View style={styles.recipeCardHeader}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.recipeImage} />
        ) : (
          <View style={[styles.recipeImage, styles.placeholderImage]}>
            <Text style={{ fontSize: 40 }}>👨‍🍳</Text>
          </View>
        )}
        <View style={styles.recipeBadge}>
          <Text style={styles.recipeBadgeText}>{item.category || 'Món ngon'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={(e) => {
            e.stopPropagation();
            onFavoritePress && onFavoritePress(item.id);
          }}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorited ? Colors.error : Colors.textLight} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.recipeMeta}>
          <View style={styles.recipeMetaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textLight} />
            <Text style={styles.recipeMetaText}>{item.time || '30 min'}</Text>
          </View>
          <View style={styles.recipeMetaItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.recipeMetaText}>{item.rating || '4.5'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recipeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 15,
  },
  recipeCardHeader: {
    height: 150,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recipeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    padding: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    height: 40,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeMetaText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
});

export default RecipeCard;
