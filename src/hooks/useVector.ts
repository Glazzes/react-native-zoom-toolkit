import { useSharedValue } from 'react-native-reanimated';

export const useVector = (x: number, y?: number) => {
  const first = useSharedValue<number>(x);
  const second = useSharedValue<number>(y ?? x);

  return { x: first, y: second };
};
