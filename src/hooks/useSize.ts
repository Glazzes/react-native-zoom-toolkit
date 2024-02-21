import { useSharedValue } from 'react-native-reanimated';

export const useSize = (x: number, y?: number) => {
  const first = useSharedValue<number>(x);
  const second = useSharedValue<number>(y ?? x);

  return { width: first, height: second };
};
