import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import styles from './styles';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'ob_title_1',
    description: 'ob_desc_1',
    icon: '🍳',
  },
  {
    id: '2',
    title: 'ob_title_2',
    description: 'ob_desc_2',
    icon: '🥗',
  },
  {
    id: '3',
    title: 'ob_title_3',
    description: 'ob_desc_3',
    icon: '👨‍🍳',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('PreferenceQuiz');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Text style={styles.placeholderImage}>{item.icon}</Text>
      </View>
      <Text style={styles.title}>{t(item.title)}</Text>
      <Text style={styles.description}>{t(item.description)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <View style={styles.dotContainer}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index.toString()}
                style={[styles.dot, index === currentIndex && styles.activeDot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? t('ob_btn_start') : t('ob_btn_next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;
