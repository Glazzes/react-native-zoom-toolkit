import type { SizeVector } from '../commons/types';

type Options = {
  aspectRatio: number;
  maxWidth?: number;
  maxHeight?: number;
};

export const getAspectRatioSize = (options: Options): SizeVector<number> => {
  'worklet';
  const { aspectRatio, maxWidth, maxHeight } = options;
  if (maxWidth !== undefined) {
    return {
      width: Math.round(maxWidth),
      height: Math.round(maxWidth / aspectRatio),
    };
  }

  if (maxHeight !== undefined) {
    return {
      width: Math.round(maxHeight * aspectRatio),
      height: Math.round(maxHeight),
    };
  }

  throw Error(
    'maxWidth and maxHeight parameters are undefined, consider adding one of them'
  );
};
