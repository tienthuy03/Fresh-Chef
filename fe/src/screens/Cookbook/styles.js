import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@constants/Colors';

export default StyleSheet.create({
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
    paddingHorizontal: 16,
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
