import { Dimensions } from 'react-native';

const dimensions = Dimensions.get('screen');
export const maxDimension = Math.max(dimensions.width, dimensions.height);

export const theme = {
  colors: {
    icon: '#fff',
    foreground: '#242426',
    username: '#fff',
    online: '#8AB4F8',
    foregroundAccent: '#6E6E6E',
    userMessage: '#4B779E',
    friendMessage: '#2A3038',
  },
  sizes: {
    iconSize: 24,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
  },
};
