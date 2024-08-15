import type { SizeVector } from '../commons/types';

type Options = {
  aspectRatio: number;
  width?: number;
  height?: number;
};

/**
 * @description Gets width and height based on the aspect ratio.
 * @param options An object describing the aspect ratio of an image/video, and optional width and height
 * parameters, calculates height if this is undefined based on width and vice versa.
 * @returns An object containing the computed width and height by the aspect ratio.
 */
export const getAspectRatioSize = (options: Options): SizeVector<number> => {
  'worklet';
  const { aspectRatio, width, height } = options;
  if (width === undefined && height === undefined) {
    throw Error(
      'maxWidth and maxHeight parameters are undefined, provide at least one of them'
    );
  }

  if (width !== undefined) {
    return {
      width: Math.floor(width),
      height: Math.floor(width / aspectRatio),
    };
  }

  return {
    width: Math.floor(height! * aspectRatio),
    height: Math.floor(height!),
  };
};
