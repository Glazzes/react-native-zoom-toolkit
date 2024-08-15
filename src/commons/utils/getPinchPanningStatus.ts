import { Platform } from 'react-native';
import { version } from 'react-native-gesture-handler/package.json';

const data = version.split('.')!;
const major = parseInt(data[0]!, 10);
const minor = parseInt(data[1]!, 10);

export const getPinchPanningStatus = (): boolean => {
  if (Platform.OS === 'ios') {
    return major > 2 || (major === 2 && minor >= 16);
  }

  return true;
};
