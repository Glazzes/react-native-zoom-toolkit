import type { CanvasSize } from '../types';

type Options = {
  aspectRatio: number;
  maxWidth?: number;
  maxHeight?: number;
};

export const getAspectRatioSize = (options: Options): CanvasSize => {
  'worklet';
  const { aspectRatio, maxWidth, maxHeight } = options;
  if (maxWidth) {
    return {
      width: Math.round(maxWidth),
      height: Math.round(maxWidth / aspectRatio),
    };
  }

  if (maxHeight) {
    return {
      width: Math.round(maxHeight * aspectRatio),
      height: Math.round(maxHeight),
    };
  }

  throw Error(
    'Missing maxWidth and maxHeight properties, consider adding one of them'
  );
};
