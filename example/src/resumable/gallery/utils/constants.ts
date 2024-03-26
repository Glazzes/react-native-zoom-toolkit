import { Dimensions } from 'react-native';
import { Easing, type WithTimingConfig } from 'react-native-reanimated';

export const PREVIEW_SIZE = 50;

export const SCROLL_SIZE = Dimensions.get('window').width;

export const images: string[] = [
  'https://kutyaknak.hu/shop_ordered/73803/pic/gsp.jpg',
  'https://cdn.britannica.com/02/132502-050-F4667944/macaw.jpg',
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg',
  'https://i0.wp.com/bcc-newspack.s3.amazonaws.com/uploads/2023/05/052323-Foxes-in-Millennium-Park-Colin-Boyle-9124.jpg?fit=1650%2C1099&ssl=1',
];

export const TIMING_CONFIG: WithTimingConfig = {
  duration: 250,
  easing: Easing.linear,
};
