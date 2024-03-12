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

type CropContext = {
  x: number;
  y: number;
  width: number;
  height: number;
  resizeWidth: number;
  resizeHeight: number;
};

type FixedCropContext = {
  x: number;
  y: number;
  resolution: SizeVector<number>;
  cropSize: SizeVector<number>;
  scale: number;
  fixedWidth: number;
  isFlipped: boolean;
};

type MapContextOptions = {
  context: CropContext;
  additionalContext: CropContextResult['context'];
  hasFixedWidth: boolean;
};

export const canvasToSize = (
  options: CanvasToSizeOptions
): CropContextResult => {
  const { cropSize, canvas, resolution, position, scale, fixedWidth, context } =
    options;

  const isFlipped = context.rotationAngle % Math.PI !== 0;

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
  const resizeWidth = resolution.width;
  const resizeHeight = resolution.height;

  let cropContext: CropContext = {
    x,
    y,
    width,
    height,
    resizeWidth,
    resizeHeight,
  };

  const pictureAspectRatio = resolution.width / resolution.height;

  if (fixedWidth !== undefined && pictureAspectRatio <= 1) {
    cropContext = canvasToSizePortrait({
      x,
      y,
      cropSize,
      resolution,
      scale,
      isFlipped,
      fixedWidth,
    });
  }

  if (fixedWidth !== undefined && pictureAspectRatio > 1) {
    cropContext = canvasToSizeLandscape({
      x,
      y,
      cropSize,
      resolution,
      scale,
      isFlipped,
      fixedWidth,
    });
  }

  return mapContext({
    context: cropContext,
    additionalContext: options.context,
    hasFixedWidth: fixedWidth !== undefined,
  });
};

const canvasToSizePortrait = (context: FixedCropContext): CropContext => {
  const { cropSize, resolution, scale, fixedWidth, isFlipped, x, y } = context;

  const minDimension = Math.min(resolution.width, resolution.height) / scale;
  const cropAspectRatio = cropSize.width / cropSize.height;

  const direction = isFlipped ? fixedWidth / cropAspectRatio : fixedWidth;
  const resizer = direction / minDimension;

  const finalX = x * resizer;
  const finalY = y * resizer;
  const finalWidth = fixedWidth;
  const finalHeight = fixedWidth / cropAspectRatio;
  const resizeWidth = resolution.width * resizer;
  const resizeHeight = resolution.height * resizer;

  return {
    x: finalX,
    y: finalY,
    width: finalWidth,
    height: finalHeight,
    resizeWidth: Math.ceil(resizeWidth),
    resizeHeight: Math.ceil(resizeHeight),
  };
};

const canvasToSizeLandscape = (context: FixedCropContext): CropContext => {
  const { cropSize, resolution, scale, fixedWidth, isFlipped, x, y } = context;

  const minDimension = Math.min(resolution.width, resolution.height) / scale;
  const cropAspectRatio = cropSize.width / cropSize.height;

  const direction = isFlipped ? fixedWidth * cropAspectRatio : fixedWidth;
  const resizer = direction / minDimension;

  const width = fixedWidth * cropAspectRatio;
  const height = fixedWidth;
  const inverseAspectRatio = height / width;

  const finalX = x * resizer * inverseAspectRatio;
  const finalY = y * resizer * inverseAspectRatio;
  const finalWidth = width * inverseAspectRatio;
  const finalHeight = height * inverseAspectRatio;
  const resizeWidth = resolution.width * resizer * inverseAspectRatio;
  const resizeHeight = resolution.height * resizer * inverseAspectRatio;

  return {
    x: finalX,
    y: finalY,
    width: finalWidth,
    height: finalHeight,
    resizeWidth: Math.ceil(resizeWidth),
    resizeHeight: Math.ceil(resizeHeight),
  };
};

const flipSizeVector = (vector: SizeVector<number>): SizeVector<number> => {
  return {
    width: vector.height,
    height: vector.width,
  };
};

const mapContext = (options: MapContextOptions): CropContextResult => {
  const { context, additionalContext, hasFixedWidth } = options;

  let resize: SizeVector<number> | undefined;
  if (hasFixedWidth) {
    resize = { width: context.resizeWidth, height: context.resizeHeight };
  }

  return {
    crop: {
      originX: context.x,
      originY: context.y,
      width: context.width,
      height: context.height,
    },
    context: {
      rotationAngle: additionalContext.rotationAngle * (180 / Math.PI),
      flipHorizontal: additionalContext.flipHorizontal,
      flipVertical: additionalContext.flipVertical,
    },
    resize: resize,
  };
};
