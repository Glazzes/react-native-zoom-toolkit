import type { ResizeConfig } from '../../components/snapback/types';
import { Extrapolation, interpolate } from 'react-native-reanimated';

type ResizeOptions = {
  resizeConfig: ResizeConfig | undefined;
  width: number;
  height: number;
  scale: number;
};

type AspectRatioSize = {
  width: number;
  height: number;
  deltaX: number;
  deltaY: number;
};

export const resizeToAspectRatio = ({
  resizeConfig,
  width,
  height,
  scale,
}: ResizeOptions): AspectRatioSize => {
  'worklet';
  let finalWidth = width;
  let finalHeight = height;

  if (resizeConfig !== undefined) {
    const { size, aspectRatio, scale: resizeScale } = resizeConfig;
    const isWide = aspectRatio > 1;

    finalWidth = isWide
      ? interpolate(
          scale,
          [1, resizeScale],
          [size.width, size.height * aspectRatio],
          Extrapolation.CLAMP
        )
      : size.width;

    finalHeight = isWide
      ? size.height
      : interpolate(
          scale,
          [1, resizeScale],
          [size.height, size.width / aspectRatio],
          Extrapolation.CLAMP
        );
  }

  const deltaX = (finalWidth - width) / 2;
  const deltaY = (finalHeight - height) / 2;

  return { width: finalWidth, height: finalHeight, deltaX, deltaY };
};
