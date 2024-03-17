import { Dimensions } from 'react-native';
import { Easing, type WithTimingConfig } from 'react-native-reanimated';

export const PREVIEW_SIZE = 50;

export const SCROLL_SIZE = Dimensions.get('window').width;

export const images: string[] = [
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg',
  'https://cdn.britannica.com/02/132502-050-F4667944/macaw.jpg',
  'https://www.zooplus.es/magazine/wp-content/uploads/2019/04/labrador-3-Farben.jpg',
];

export const TIMING_CONFIG: WithTimingConfig = {
  duration: 250,
  easing: Easing.linear,
};
