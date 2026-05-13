import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@constants/Colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    padding: 5,
  },
  listContainer: {
    padding: 20,
  },
  recipeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 15,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  recipeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  recipeBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  recipeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  recipeMetaText: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 5,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.textLight,
  },
});
