import { Platform } from 'react-native';
import { version } from 'react-native-gesture-handler/package.json';

const data = version.split('.')!;
const major = parseInt(data[0]!, 10);
const minor = parseInt(data[1]!, 10);

export const getPanWithPinchStatus = (): boolean => {
  if (Platform.OS === 'ios') {
    if (major > 2) return true;
    if (major === 2 && minor >= 16) return true;
  }

  return Platform.OS !== 'ios';
};
