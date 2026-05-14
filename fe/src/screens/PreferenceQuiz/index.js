import React, { useState, useEffect } from 'react';
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
import { useGetMeQuery } from '@redux/api/Auth';
import { Colors } from '@constants/Colors';
import { setSurveyCompleted } from '@redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DIET_OPTIONS = ['Vegan', 'Keto', 'Paleo', 'Low-Carb', 'Gluten-Free', 'Vegetarian', 'Dairy-Free'];
const TIME_OPTIONS = ['< 15 mins', '15-30 mins', '30-60 mins', '60+ mins'];
const SIZE_OPTIONS = ['1 person', '2 people', '4 people', '6+ people'];

const PreferenceQuizScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLogged } = useSelector((state) => state.auth);
  const { data: optionsData, isLoading: isLoadingOptions } = useGetQuizOptionsQuery();
  const { data: profileData } = useGetMeQuery(undefined, { skip: !isLogged });
  const [submitSurvey] = useSubmitSurveyMutation();
  
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [timeLimit, setTimeLimit] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLogged && profileData?.Data?.preferences) {
      const prefs = profileData.Data.preferences;
      if (prefs.diets) setSelectedDiets(prefs.diets);
      if (prefs.timeLimit) setTimeLimit(prefs.timeLimit);
      if (prefs.householdSize) {
        if (Array.isArray(prefs.householdSize)) {
          setSelectedSizes(prefs.householdSize);
        } else {
          const matched = SIZE_OPTIONS.find(opt => opt.startsWith(prefs.householdSize.toString()));
          if (matched) setSelectedSizes([matched]);
        }
      }
    }
  }, [isLogged, profileData]);

  const toggleSelection = (item, state, setState) => {
    if (state.includes(item)) {
      setState(state.filter((i) => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('HAS_LAUNCHED', 'true');
    } catch (e) {}
    
    if (isLogged) {
       navigation.replace('Main');
    } else {
       navigation.navigate('Register', { preferences: null });
    }
  };

  const handleContinue = async () => {
    const preferences = {
      diets: selectedDiets,
      timeLimit: timeLimit,
      householdSize: selectedSizes, // Now sending array
    };

    if (isLogged) {
      try {
        setIsSubmitting(true);
        await submitSurvey(preferences).unwrap();
        dispatch(setSurveyCompleted(true));
        setIsSubmitting(false);
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

  if (isLoadingOptions) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('quiz_title')}</Text>
        <Text style={styles.subtitle}>{t('quiz_subtitle')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('select_diets')}</Text>
          {renderChips(diets, selectedDiets, (v) => toggleSelection(v, selectedDiets, setSelectedDiets), true)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('max_time')}</Text>
          {renderChips(timeLimits, timeLimit, setTimeLimit)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('family_size')}</Text>
          {renderChips(familySizes, selectedSizes, (v) => toggleSelection(v, selectedSizes, setSelectedSizes), true)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, (!timeLimit || selectedSizes.length === 0 || isSubmitting) && { opacity: 0.5 }]} 
          onPress={handleContinue}
          disabled={!timeLimit || selectedSizes.length === 0 || isSubmitting}
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
