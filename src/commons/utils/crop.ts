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

export const crop = ({
  cropSize,
  canvas,
  resolution,
  position,
  scale,
  fixedWidth,
  context,
}: CanvasToSizeOptions): CropContextResult => {
  const isFlipped = context.rotationAngle % 180 !== 0;

  let currentCanvas = canvas;
  let currentResolution = resolution;
  if (isFlipped) {
    currentCanvas = flipVector(canvas);
    currentResolution = flipVector(resolution);
  }

  const offsetX = (currentCanvas.width * scale - cropSize.width) / 2;
  const offsetY = (currentCanvas.height * scale - cropSize.height) / 2;

  const normalizedX = Math.abs(offsetX) + position.x;
  const normalizedY = Math.abs(offsetY) + position.y;

  const relativeX = cropSize.width / (currentCanvas.width * scale);
  const relativeY = cropSize.height / (currentCanvas.height * scale);

  // (1 - relative) - (1 - normalized / (2 * offset)) I just do not like NaN checks
  const posX = interpolate(normalizedX, [0, 2 * offsetX], [1 - relativeX, 0]);
  const posY = interpolate(normalizedY, [0, 2 * offsetY], [1 - relativeY, 0]);

  const x = currentResolution.width * posX;
  const y = currentResolution.height * posY;
  const width = currentResolution.width * relativeX;
  const height = currentResolution.height * relativeY;
  let resize: SizeVector<number> | undefined;

  let fixer = 1;
  if (fixedWidth !== undefined) {
    fixer = fixedWidth / width;
    resize = {
      width: Math.ceil(resolution.width * fixer),
      height: Math.ceil(resolution.height * fixer),
    };
  }

  return {
    crop: {
      originX: x * fixer,
      originY: y * fixer,
      width: Math.round(width * fixer),
      height: Math.round(height * fixer),
    },
    context,
    resize,
  };
};
