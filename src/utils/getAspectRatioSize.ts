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
 * @see https://glazzes.github.io/react-native-zoom-toolkit/utilities/getAspectRatioSize.html
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
      width: Math.floor(maxWidth),
      height: Math.floor(maxWidth / aspectRatio),
    };
  }

  return {
    width: Math.floor(maxHeight! * aspectRatio),
    height: Math.floor(maxHeight!),
  };
}
