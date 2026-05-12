import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import styles from './styles';
import { useTranslation } from 'react-i18next';

const DIET_OPTIONS = ['Vegan', 'Keto', 'Paleo', 'Low-Carb', 'Gluten-Free', 'Vegetarian', 'Dairy-Free'];
const TIME_OPTIONS = ['< 15 mins', '15-30 mins', '30-60 mins', '60+ mins'];
const SIZE_OPTIONS = ['1 person', '2 people', '4 people', '6+ people'];

const PreferenceQuizScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [timeLimit, setTimeLimit] = useState('');
  const [householdSize, setHouseholdSize] = useState('');

  const toggleDiet = (diet) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter((d) => d !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  };

  const handleContinue = () => {
    // Collect all preferences
    const preferences = {
      diets: selectedDiets,
      timeLimit: timeLimit,
      householdSize: parseInt(householdSize) || 1,
    };
    
    // Navigate to Register and pass preferences
    navigation.navigate('Register', { preferences });
  };

  const renderChips = (options, selectedValue, onSelect, isMulti = false) => {
    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = isMulti ? selectedValue.includes(option) : selectedValue === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => onSelect(option)}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('quiz_title')}</Text>
        <Text style={styles.subtitle}>{t('quiz_subtitle')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('select_diets')}</Text>
          {renderChips(DIET_OPTIONS, selectedDiets, toggleDiet, true)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('max_time')}</Text>
          {renderChips(TIME_OPTIONS, timeLimit, setTimeLimit)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('family_size')}</Text>
          {renderChips(SIZE_OPTIONS, householdSize, setHouseholdSize)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, (!timeLimit || !householdSize) && { opacity: 0.5 }]} 
          onPress={handleContinue}
          disabled={!timeLimit || !householdSize}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PreferenceQuizScreen;
