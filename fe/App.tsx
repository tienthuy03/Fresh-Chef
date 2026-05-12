import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@redux/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@src/i18n'; // Initialize i18n
import AppNavigator from '@navigation/AppNavigator';
import GlobalUIContainer from '@components/GlobalUI/GlobalUIContainer';
import { StatusBar } from 'react-native';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
        <GlobalUIContainer />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
