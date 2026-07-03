import { Colors } from '@constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SmartCookingVideoModal = ({ visible, onClose, recipe }) => {


  const steps = Array.isArray(recipe.steps)
    ? recipe.steps
    : typeof recipe.steps === 'string' && recipe.steps
      ? JSON.parse(recipe.steps)
      : [];

  const totalSteps = steps.length;
  const STEP_DURATION = 15; // 15 seconds per step
  const TOTAL_DURATION = totalSteps > 0 ? totalSteps * STEP_DURATION : 60; // fallback to 60s

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  // Slow zoom effect when playing to simulate video camera work
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.12,
            duration: 12000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 12000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
    }
  }, [isPlaying, scaleAnim]);

  // Video timer logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, TOTAL_DURATION, ]);

  // Sync progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: TOTAL_DURATION > 0 ? currentTime / TOTAL_DURATION : 0,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [currentTime, TOTAL_DURATION, progressAnim]);

  // Calculate current active step index based on current time
  const activeStepIndex = totalSteps > 0
    ? Math.min(Math.floor(currentTime / STEP_DURATION), totalSteps - 1)
    : 0;

  // Auto-scroll steps list to keep active step centered
  useEffect(() => {
    if (scrollRef.current && activeStepIndex >= 0 && totalSteps > 0) {
      scrollRef.current.scrollTo({
        y: activeStepIndex * 95, // approx height of each step card + margin
        animated: true,
      });
    }
  }, [activeStepIndex, totalSteps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds) => {
    setCurrentTime((prev) => {
      const target = prev + seconds;
      return Math.max(0, Math.min(target, TOTAL_DURATION));
    });
  };

  const handleStepClick = (index) => {
    setCurrentTime(index * STEP_DURATION);
    setIsPlaying(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOpenRealVideo = () => {
    if (recipe.video_url) {
      Linking.openURL(recipe.video_url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };


  if (!recipe) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down-outline" size={28} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerLabel}>AI STEP SYNC TUTORIAL</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {recipe.title}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Simulated Video Player */}
          <View style={styles.videoWrapper}>
            <View style={styles.videoPlayer}>
              <Animated.Image
                source={{ uri: recipe.image_url }}
                style={[
                  styles.videoImage,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
                resizeMode="cover"
              />

              {/* Glowing AI smart sync badge */}
              <View style={styles.liveBadge}>
                <View style={styles.redDot} />
                <Text style={styles.liveText}>AI STEP SYNC</Text>
              </View>

              {/* Real YouTube original video button */}
              {recipe.video_url ? (
                <TouchableOpacity
                  onPress={handleOpenRealVideo}
                  style={styles.realVideoOverlayBtn}
                >
                  <Ionicons name="logo-youtube" size={12} color={Colors.white} style={{ marginRight: 5 }} />
                  <Text style={styles.realVideoOverlayBtnText}>Xem Video Gốc</Text>
                </TouchableOpacity>
              ) : null}

              {/* Center Play/Pause button overlay */}
              {!isPlaying && (
                <TouchableOpacity onPress={handlePlayPause} style={styles.playOverlay}>
                  <Ionicons name="play" size={50} color={Colors.white} />
                </TouchableOpacity>
              )}

              {/* Progress & Controls Bar */}
              <View style={styles.playerControlsContainer}>
                {/* Progress bar */}
                <View style={styles.progressBarWrapper}>
                  <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
                  <View style={styles.progressBarBg}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.timerText}>{formatTime(TOTAL_DURATION)}</Text>
                </View>

                {/* Control buttons */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity onPress={() => handleSeek(-10)} style={styles.controlBtn}>
                    <Ionicons name="play-back" size={22} color={Colors.white} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handlePlayPause} style={styles.mainPlayBtn}>
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={26}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleSeek(10)} style={styles.controlBtn}>
                    <Ionicons name="play-forward" size={22} color={Colors.white} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.controlBtn}>
                    <Ionicons
                      name={isMuted ? 'volume-mute' : 'volume-high'}
                      size={22}
                      color={Colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Interactive Steps List */}
          <View style={styles.stepsWrapper}>
            <View style={styles.stepsHeader}>
              <Ionicons name="list-circle-outline" size={22} color={Colors.primary} />
              <Text style={styles.stepsTitle}>HƯỚNG DẪN TỪNG BƯỚC ĐỒNG BỘ</Text>
            </View>

            {steps.length === 0 ? (
              <View style={styles.emptyStepsContainer}>
                <Text style={styles.emptyStepsText}>Chưa có các bước hướng dẫn cụ thể.</Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollRef}
                style={styles.stepsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.stepsListContent}
              >
                {steps.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  const isPassed = index < activeStepIndex;

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      style={[
                        styles.stepCard,
                        isActive && styles.stepCardActive,
                        isPassed && styles.stepCardPassed,
                      ]}
                      onPress={() => handleStepClick(index)}
                    >
                      <View style={styles.stepHeaderRow}>
                        <View
                          style={[
                            styles.stepNumberBadge,
                            isActive && styles.stepNumberBadgeActive,
                            isPassed && styles.stepNumberBadgePassed,
                          ]}
                        >
                          {isPassed ? (
                            <Ionicons name="checkmark" size={14} color={Colors.white} />
                          ) : (
                            <Text
                              style={[
                                styles.stepNumberText,
                                isActive && styles.stepNumberTextActive,
                              ]}
                            >
                              {index + 1}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.stepLabelText,
                            isActive && styles.stepLabelTextActive,
                          ]}
                        >
                          {isActive
                            ? 'Đang hướng dẫn...'
                            : isPassed
                              ? 'Đã hoàn thành'
                              : `Bước ${index + 1}`}
                        </Text>
                        {isActive && <View style={styles.activePulseIndicator} />}
                      </View>

                      <Text
                        style={[
                          styles.stepInstructionText,
                          isActive && styles.stepInstructionTextActive,
                        ]}
                        numberOfLines={2}
                      >
                        {typeof step === 'string'
                          ? step
                          : step.text || step.instruction || JSON.stringify(step)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E', // Slick dark mode for video player
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 5,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 10,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  videoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  liveBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 30, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  playOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  playerControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 15, 30, 0.85)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#CCC',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtn: {
    padding: 10,
    marginHorizontal: 15,
  },
  mainPlayBtn: {
    backgroundColor: Colors.white,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stepsWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8A8A9E',
    letterSpacing: 1,
    marginLeft: 8,
  },
  stepsList: {
    flex: 1,
  },
  stepsListContent: {
    paddingBottom: 40,
  },
  stepCard: {
    backgroundColor: '#1E1E30',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  stepCardActive: {
    backgroundColor: '#2A2A44',
    borderColor: 'rgba(255, 107, 107, 0.4)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  stepCardPassed: {
    opacity: 0.6,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberBadgeActive: {
    backgroundColor: Colors.primary,
  },
  stepNumberBadgePassed: {
    backgroundColor: '#34C759',
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8A8A9E',
  },
  stepNumberTextActive: {
    color: Colors.white,
  },
  stepLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A9E',
  },
  stepLabelTextActive: {
    color: Colors.primary,
  },
  activePulseIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
    marginLeft: 10,
  },
  stepInstructionText: {
    fontSize: 14,
    color: '#D1D1E0',
    lineHeight: 20,
  },
  stepInstructionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  emptyStepsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStepsText: {
    color: '#8A8A9E',
    fontStyle: 'italic',
  },
  realVideoOverlayBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  realVideoOverlayBtnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 0.5,
  },
});

export default SmartCookingVideoModal;
