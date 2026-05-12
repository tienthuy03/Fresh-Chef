import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import { useGetQuizOptionsQuery, useSubmitSurveyMutation } from '@redux/api/Preferences';
import { Colors } from '@constants/Colors';
import { setSurveyCompleted } from '@redux/slices/authSlice';

const DIET_OPTIONS = ['Vegan', 'Keto', 'Paleo', 'Low-Carb', 'Gluten-Free', 'Vegetarian', 'Dairy-Free'];
const TIME_OPTIONS = ['< 15 mins', '15-30 mins', '30-60 mins', '60+ mins'];
const SIZE_OPTIONS = ['1 person', '2 people', '4 people', '6+ people'];

const PreferenceQuizScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLogged } = useSelector((state) => state.auth);
  const { data: optionsData, isLoading, error } = useGetQuizOptionsQuery();
  const [submitSurvey] = useSubmitSurveyMutation();
  
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [timeLimit, setTimeLimit] = useState('');
  const [householdSize, setHouseholdSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDiet = (diet) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter((d) => d !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  };

  const handleContinue = async () => {
    const preferences = {
      diets: selectedDiets,
      timeLimit: timeLimit,
      householdSize: parseInt(householdSize) || 1,
    };

    if (isLogged) {
      try {
        setIsSubmitting(true);
        await submitSurvey(preferences).unwrap();
        dispatch(setSurveyCompleted(true));
        setIsSubmitting(false);
        // Explicitly replace to Main to be sure
        navigation.replace('Main');
      } catch (err) {
        setIsSubmitting(false);
        console.error('Failed to save survey:', err);
        Alert.alert(t('error_title'), t('server_error'));
      }
    } else {
      navigation.navigate('Register', { preferences });
    }
  };

  const renderChips = (options, selectedValue, onSelect, isMulti = false) => {
    if (!options) return null;
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


  const options = optionsData?.Data || {};
  const diets = options.diets || DIET_OPTIONS;
  const timeLimits = options.timeLimits || TIME_OPTIONS;
  const familySizes = options.familySizes || SIZE_OPTIONS;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('quiz_title')}</Text>
        <Text style={styles.subtitle}>{t('quiz_subtitle')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('select_diets')}</Text>
          {renderChips(diets, selectedDiets, toggleDiet, true)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('max_time')}</Text>
          {renderChips(timeLimits, timeLimit, setTimeLimit)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('family_size')}</Text>
          {renderChips(familySizes, householdSize, setHouseholdSize)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, (!timeLimit || !householdSize || isSubmitting) && { opacity: 0.5 }]} 
          onPress={handleContinue}
          disabled={!timeLimit || !householdSize || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.continueButtonText}>{t('continue')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PreferenceQuizScreen;
