import type { CanvasSize } from './types';

type Options = {
  aspecRatio: number;
  maxWidth?: number;
  maxHeight?: number;
};

export const calculateAspectRatioDimensions = (
  options: Options
): CanvasSize => {
  'worklet';
  const { aspecRatio, maxWidth, maxHeight } = options;
  if (maxWidth) {
    return {
      width: maxWidth,
      height: Math.round(maxWidth / aspecRatio),
    };
  }

  if (maxHeight) {
    return {
      width: Math.round(maxHeight * aspecRatio),
      height: maxHeight,
    };
  }

  throw Error(
    'Missing maxWidth and maxHeight properties, consider adding one of them'
  );
};
