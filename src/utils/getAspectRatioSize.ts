import type { SizeVector } from '../commons/types';

type Options = {
  aspectRatio: number;
  width?: number;
  height?: number;
};

/**
 *
 * @param options An object describing the aspect ratio of an image/video, and optional width and height
 * parameters, calculates height if this is undefined based on width and vice versa.
 * @returns An object containing the computed width and height by the aspect ratio
 */
export default function (options: Options): SizeVector<number> {
  'worklet';
  const { aspectRatio, width: maxWidth, height: maxHeight } = options;
  if (maxWidth === undefined && maxHeight === undefined) {
    throw Error(
      'maxWidth and maxHeight parameters are undefined, provide at least one of them'
    );
  }

  if (maxWidth !== undefined) {
    return {
      width: Math.round(maxWidth),
      height: Math.round(maxWidth / aspectRatio),
    };
  }

  return {
    width: Math.round(maxHeight! * aspectRatio),
    height: Math.round(maxHeight!),
  };
}
