import type { SizeVector } from '../types';

export const getMaxScale = (
  canvasSize: SizeVector<number>,
  resolution: SizeVector<number>
): number => {
  'worklet';

  const maxResolutionSide = Math.max(resolution.width, resolution.height);
  const maxCropSide = Math.max(canvasSize.width, canvasSize.height);

  return Math.max(1, maxResolutionSide / maxCropSide);
};
