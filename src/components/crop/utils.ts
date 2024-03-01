import type { SizeVector, Vector } from '../../commons/types';

type CanvasToSizeOptions = {
  cropSize: SizeVector<number>;
  canvasSize: SizeVector<number>;
  resolution: SizeVector<number>;
  position: Vector<number>;
  scale: number;
  rotationAngle: number;
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

/*
 * "But brooo, didn't you read Clean Code? Functions shouldn't be longer than 20 lines"
 * Welcome to the real world pal, Math in code takes a whole lot of space and repetition
 */
const canvasToSize = (options: CanvasToSizeOptions): CropContext => {
  const {
    cropSize,
    canvasSize,
    resolution,
    position,
    scale,
    fixedWidth,
    rotationAngle,
  } = options;

  const isFlipped = rotationAngle % Math.PI !== 0;

  let currentCanvasSize = canvasSize;
  let currentResolution = resolution;
  if (isFlipped) {
    currentCanvasSize = flipSizeVector(canvasSize);
    currentResolution = flipSizeVector(resolution);
  }

  const offsetX = (currentCanvasSize.width * scale - cropSize.width) / 2;
  const offsetY = (currentCanvasSize.height * scale - cropSize.height) / 2;

  const relativeX = cropSize.width / (currentCanvasSize.width * scale);
  const relativeY = cropSize.height / (currentCanvasSize.height * scale);

  const normalizedX = Math.abs(offsetX) + position.x;
  const normalizedY = Math.abs(offsetY) + position.y;

  let posX = (1 - relativeX) * (1 - normalizedX / (2 * offsetX));
  let posY = (1 - relativeY) * (1 - normalizedY / (2 * offsetY));
  posX = isNaN(posX) ? 0 : posX;
  posY = isNaN(posY) ? 0 : posY;

  const x = currentResolution.width * posX;
  const y = currentResolution.height * posY;
  const pictureAspectRatio = resolution.width / resolution.height;

  if (fixedWidth !== undefined && pictureAspectRatio <= 1) {
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
      resizeWidth,
      resizeHeight,
    };
  }

  if (fixedWidth !== undefined && pictureAspectRatio > 1) {
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
      resizeWidth,
      resizeHeight,
    };
  }

  return {
    x,
    y,
    width: currentResolution.width * relativeX,
    height: currentResolution.height * relativeY,
    resizeWidth: resolution.width,
    resizeHeight: resolution.height,
  };
};

const flipSizeVector = (vector: SizeVector<number>): SizeVector<number> => {
  return {
    width: vector.height,
    height: vector.width,
  };
};

export default canvasToSize;
