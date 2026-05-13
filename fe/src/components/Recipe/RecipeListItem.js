import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';

const RecipeListItem = ({
  item,
  isFavorited,
  onFavoritePress,
  onPress,
  showMatchScore,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={{ fontSize: 30 }}>👨‍🍳</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>
          {item.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={Colors.textLight} />
          <Text style={styles.metaText}>{item.time || '30 min'}</Text>
          <Ionicons
            name="star"
            size={14}
            color="#FFD700"
            style={{ marginLeft: 10 }}
          />
          <Text style={styles.metaText}>{item.rating || '4.5'}</Text>
        </View>

        {showMatchScore && item.matchScore && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>
              Khớp {Math.round(item.matchScore * 100)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={e => {
              e.stopPropagation();
              onFavoritePress(item.id);
            }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? Colors.error : Colors.textLight}
            />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-forward" size={20} color={Colors.border} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  placeholderImage: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 10,
    marginRight: 5,
  },
  matchBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  matchText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default RecipeListItem;
