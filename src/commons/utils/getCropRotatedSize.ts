import getAspectRatioSize from '../../utils/getAspectRatioSize';
import type { SizeVector } from '../types';

type Options = {
  size: SizeVector<number>;
  angle: number;
  aspectRatio?: number;
};

export const getCropRotatedSize = (options: Options): SizeVector<number> => {
  'worklet';
  const { size, angle, aspectRatio = 1 } = options;

  const sinWidth = Math.abs(size.height * Math.sin(angle));
  const cosWidth = Math.abs(size.width * Math.cos(angle));

  const sinHeight = Math.abs(size.height * Math.cos(angle));
  const cosHeight = Math.abs(size.width * Math.sin(angle));

  const maxWidth = sinWidth + cosWidth;
  const maxHeight = sinHeight + cosHeight;

  return getAspectRatioSize({
    aspectRatio: aspectRatio,
    maxWidth: aspectRatio >= 1 ? undefined : maxWidth,
    maxHeight: aspectRatio > 1 ? maxHeight : undefined,
  });
};
