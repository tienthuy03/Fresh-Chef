import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@constants/Colors';
import { Spacing, Radius } from '@constants/Spacing';
import { FontSize, Fonts } from '@constants/Typography';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: Colors.surface,
    borderRadius: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  placeholderImage: {
    fontSize: 160,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.md,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.round,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
});
