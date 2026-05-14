import React from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';

const SearchBar = ({ 
  value, 
  onChangeText, 
  placeholder, 
  isLoading = false,
  onClear,
  rightAction,
  onRightActionPress,
  containerStyle 
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.searchWrapper}>
        <Ionicons 
          name="search-outline" 
          size={20} 
          color={Colors.textLight} 
          style={styles.searchIcon} 
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor={Colors.textLight}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color={Colors.primary} 
            style={styles.loading} 
          />
        )}
        {!isLoading && value?.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      
      {rightAction && (
        <TouchableOpacity 
          style={styles.rightActionButton} 
          onPress={onRightActionPress}
        >
          {rightAction}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
  },
  loading: {
    marginLeft: 10,
  },
  clearButton: {
    marginLeft: 10,
  },
  rightActionButton: {
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default SearchBar;
