import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Size } from '../types';

export const useSizeVector = (
  x: number,
  y: number
): Size<SharedValue<number>> => {
  const first = useSharedValue<number>(x);
  const second = useSharedValue<number>(y);

  return { width: first, height: second };
};
