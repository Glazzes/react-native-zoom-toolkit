import { interpolate } from 'react-native-reanimated';
import type { SizeVector, Vector } from '../types';
import type { CropContextResult } from '../../components/crop/types';

type CanvasToSizeOptions = {
  context: CropContextResult['context'];
  cropSize: SizeVector<number>;
  canvas: SizeVector<number>;
  resolution: SizeVector<number>;
  position: Vector<number>;
  scale: number;
  fixedWidth?: number;
};

const flipVector = (vector: SizeVector<number>): SizeVector<number> => {
  return {
    width: vector.height,
    height: vector.width,
  };
};

export const crop = (options: CanvasToSizeOptions): CropContextResult => {
  'worklet';
  const { cropSize, canvas, resolution, position, scale, fixedWidth, context } =
    options;

  const isFlipped = context.rotationAngle % 180 !== 0;
  const currentCanvas = isFlipped ? flipVector(canvas) : canvas;
  const currentResolution = isFlipped ? flipVector(resolution) : resolution;

  const offsetX = (currentCanvas.width * scale - cropSize.width) / 2;
  const offsetY = (currentCanvas.height * scale - cropSize.height) / 2;

  const normalizedX = Math.abs(offsetX) + position.x;
  const normalizedY = Math.abs(offsetY) + position.y;

  const relativeX = cropSize.width / (currentCanvas.width * scale);
  const relativeY = cropSize.height / (currentCanvas.height * scale);

  const posX = interpolate(normalizedX, [0, 2 * offsetX], [1 - relativeX, 0]);
  const posY = interpolate(normalizedY, [0, 2 * offsetY], [1 - relativeY, 0]);

  const x = currentResolution.width * posX;
  const y = currentResolution.height * posY;
  const width = currentResolution.width * relativeX;
  const height = currentResolution.height * relativeY;
  let resize: SizeVector<number> | undefined;

  // Make a normal crop, if the fixedWidth is defined just resize everything to meet the ratio
  // between fixedWidth and the width of the crop.
  let sizeModifier = 1;
  if (fixedWidth !== undefined) {
    sizeModifier = fixedWidth / width;
    resize = {
      width: Math.ceil(resolution.width * sizeModifier),
      height: Math.ceil(resolution.height * sizeModifier),
    };
  }

  return {
    crop: {
      originX: x * sizeModifier,
      originY: y * sizeModifier,
      width: Math.round(width * sizeModifier),
      height: Math.round(height * sizeModifier),
    },
    context,
    resize,
  };
};
