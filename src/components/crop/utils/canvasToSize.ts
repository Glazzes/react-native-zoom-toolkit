import { interpolate } from 'react-native-reanimated';
import type { SizeVector, Vector } from '../../../commons/types';
import type { CropContextResult } from '../types';

type CanvasToSizeOptions = {
  context: CropContextResult['context'];
  cropSize: SizeVector<number>;
  canvas: SizeVector<number>;
  resolution: SizeVector<number>;
  position: Vector<number>;
  scale: number;
  fixedWidth?: number;
};

type FixedCropContext = {
  position: Vector<number>;
  resolution: SizeVector<number>;
  cropSize: SizeVector<number>;
  scale: number;
  fixedWidth: number;
  isFlipped: boolean;
  context: CropContextResult['context'];
};

export const canvasToSize = ({
  cropSize,
  canvas,
  resolution,
  position,
  scale,
  fixedWidth,
  context,
}: CanvasToSizeOptions): CropContextResult => {
  const isFlipped = context.rotationAngle % 180 !== 0;

  let currentCanvasSize = canvas;
  let currentResolution = resolution;
  if (isFlipped) {
    currentCanvasSize = flipSizeVector(canvas);
    currentResolution = flipSizeVector(resolution);
  }

  const offsetX = (currentCanvasSize.width * scale - cropSize.width) / 2;
  const offsetY = (currentCanvasSize.height * scale - cropSize.height) / 2;

  const normalizedX = Math.abs(offsetX) + position.x;
  const normalizedY = Math.abs(offsetY) + position.y;

  const relativeX = cropSize.width / (currentCanvasSize.width * scale);
  const relativeY = cropSize.height / (currentCanvasSize.height * scale);

  // (1 - relative) - (1 - normalized / (2 * offset)) I just do not like NaN checks
  const posX = interpolate(normalizedX, [0, 2 * offsetX], [1 - relativeX, 0]);
  const posY = interpolate(normalizedY, [0, 2 * offsetY], [1 - relativeY, 0]);

  const x = currentResolution.width * posX;
  const y = currentResolution.height * posY;
  const width = currentResolution.width * relativeX;
  const height = currentResolution.height * relativeY;

  if (fixedWidth !== undefined) {
    return canvasToSizeFixed({
      position: { x, y },
      cropSize,
      resolution,
      scale,
      isFlipped,
      fixedWidth,
      context,
    });
  }

  return {
    crop: {
      originX: x,
      originY: y,
      width,
      height,
    },
    context,
    resize: undefined,
  };
};

const canvasToSizeFixed = (options: FixedCropContext): CropContextResult => {
  const {
    context,
    cropSize,
    resolution,
    scale,
    fixedWidth,
    isFlipped,
    position,
  } = options;

  const minDimension = Math.min(resolution.width, resolution.height) / scale;
  const cropAspectRatio = cropSize.width / cropSize.height;

  let width = fixedWidth;
  let height = fixedWidth / cropAspectRatio;
  let dimension = isFlipped ? height : width;
  let resizer = dimension / minDimension;
  let landscapeResizer = 1;

  if (resolution.width > resolution.height) {
    width = fixedWidth * cropAspectRatio;
    height = fixedWidth;
    dimension = isFlipped ? width : height;
    resizer = dimension / minDimension;
    landscapeResizer = height / width;
  }

  const finalX = position.x * resizer * landscapeResizer;
  const finalY = position.y * resizer * landscapeResizer;
  const finalWidth = width * landscapeResizer;
  const finalHeight = height * landscapeResizer;
  const resizeWidth = resolution.width * resizer * landscapeResizer;
  const resizeHeight = resolution.height * resizer * landscapeResizer;

  return {
    crop: {
      originX: finalX,
      originY: finalY,
      width: finalWidth,
      height: finalHeight,
    },
    context,
    resize: {
      width: Math.ceil(resizeWidth),
      height: Math.ceil(resizeHeight),
    },
  };
};

const flipSizeVector = (vector: SizeVector<number>): SizeVector<number> => {
  return {
    width: vector.height,
    height: vector.width,
  };
};
