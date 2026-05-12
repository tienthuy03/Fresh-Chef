import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import { NativeModules, Platform } from 'react-native';

let reactotron;

if (__DEV__) {
  const sourceCode = NativeModules.SourceCode;
  const scriptURL = sourceCode ? sourceCode.scriptURL : null;
  const scriptHostname = scriptURL 
    ? scriptURL.split('://')[1].split(':')[0] 
    : (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

  reactotron = Reactotron.configure({
    name: 'Fresh Chef',
    host: scriptHostname,
  })
    .useReactNative()
    .use(reactotronRedux())
    .connect();

  // Clear Reactotron on every reload
  Reactotron.clear();

  // Console.log redirection to Reactotron
  console.tron = Reactotron;
}

export default reactotron;
