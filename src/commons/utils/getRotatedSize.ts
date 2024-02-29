import { getAspectRatioSize } from '../../utils/getAspectRatioSize';
import type { SizeVector } from '../types';

type Options = {
  size: SizeVector<number>;
  angle: number;
  aspectRatio?: number;
};

export const getRotatedSize = (options: Options): SizeVector<number> => {
  'worklet';
  const { size, angle, aspectRatio = 1 } = options;

  const sinWidth = Math.abs(size.height * Math.sin(angle));
  const cosWidth = Math.abs(size.width * Math.cos(angle));

  const sinHeight = Math.abs(size.height * Math.cos(angle));
  const cosHeight = Math.abs(size.width * Math.sin(angle));

  const maxWidth = sinWidth + cosWidth;
  const maxHeight = sinHeight + cosHeight;

  const { width, height } = getAspectRatioSize({
    aspectRatio: aspectRatio,
    maxWidth: aspectRatio >= 1 ? undefined : maxWidth,
    maxHeight: aspectRatio > 1 ? maxHeight : undefined,
  });

  if (aspectRatio <= 1 && size.height > height) {
    throw new Error(
      "Impossible crop: cropSize's height is bigger than the height of your component"
    );
  }

  if (aspectRatio > 1 && size.width > width) {
    throw new Error(
      "Impossible crop: cropSize's width is bigger than the width of your component"
    );
  }

  return { width, height };
};
