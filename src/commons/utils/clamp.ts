export const clamp = (
  value: number,
  lowerBound: number,
  upperBound: number
): number => {
  'worklet';
  return Math.max(lowerBound, Math.min(value, upperBound));
};
