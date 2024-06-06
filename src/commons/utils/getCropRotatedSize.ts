import type { SizeVector } from '../types';
import getAspectRatioSize from '../../utils/getAspectRatioSize';

type Options = {
  crop: SizeVector<number>;
  resolution: SizeVector<number>;
  angle: number;
};

export const getCropRotatedSize = (options: Options): SizeVector<number> => {
  'worklet';
  const { crop, angle, resolution } = options;
  const cropAspectRatio = crop.width / crop.height;
  let base = crop;

  const flipped = angle % Math.PI === 0;
  const aspectRatio = resolution.width / resolution.height;
  const inverseAspectRatio = resolution.height / resolution.width;

  base = getAspectRatioSize({
    aspectRatio: flipped ? aspectRatio : inverseAspectRatio,
    width: cropAspectRatio >= 1 ? undefined : crop.width,
    height: cropAspectRatio >= 1 ? crop.height : undefined,
  });

  let resizer = 1;
  if (base.height < crop.height) resizer = crop.height / base.height;
  if (base.width < crop.width) resizer = crop.width / base.width;
  base.width = base.width * resizer;
  base.height = base.height * resizer;

  const maxWidth =
    Math.abs(base.height * Math.sin(angle)) +
    Math.abs(base.width * Math.cos(angle));

  const maxHeight =
    Math.abs(base.height * Math.cos(angle)) +
    Math.abs(base.width * Math.sin(angle));

  return getAspectRatioSize({
    aspectRatio: aspectRatio,
    width: aspectRatio >= 1 ? undefined : maxWidth,
    height: aspectRatio >= 1 ? maxHeight : undefined,
  });
};
