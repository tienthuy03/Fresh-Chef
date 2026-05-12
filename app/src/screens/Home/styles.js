import { StyleSheet } from 'react-native';
import { Colors } from '@constants/Colors';
import { Spacing, Radius } from '@constants/Spacing';
import { FontSize, Fonts } from '@constants/Typography';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.title,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: FontSize.md,
  },
});
