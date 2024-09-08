import { getVisibleRect } from './getVisibleRect';

import type { SizeVector, Vector } from '../types';
import type { CropContextResult } from '../../components/crop/types';

type CanvasToSizeOptions = {
  context: CropContextResult['context'];
  cropSize: SizeVector<number>;
  canvas: SizeVector<number>;
  resolution: SizeVector<number>;
  offset: Vector<number>;
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
  const { cropSize, canvas, resolution, offset, scale, fixedWidth, context } =
    options;

  const isFlipped = context.rotationAngle % 180 !== 0;
  const actualCanvasSize = isFlipped ? flipVector(canvas) : canvas;
  const actualResolution = isFlipped ? flipVector(resolution) : resolution;

  let resize: SizeVector<number> | undefined;
  const { x, y, width, height } = getVisibleRect({
    scale,
    visibleSize: cropSize,
    canvasSize: actualCanvasSize,
    elementSize: actualResolution,
    offset,
  });

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
