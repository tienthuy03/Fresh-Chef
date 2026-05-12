module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@src': './src',
          '@components': './src/components',
          '@constants': './src/constants',
          '@redux': './src/redux',
          '@screens': './src/screens',
          '@assets': './src/assets',
          '@utils': './src/utils',
          '@api': './src/api',
          '@navigation': './src/navigation',
        },
      },
    ],
  ],
};
