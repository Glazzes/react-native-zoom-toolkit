import { interpolate } from 'react-native-reanimated';
import type { SizeVector, Vector } from '../types';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Options = {
  scale: number;
  canvasSize: SizeVector<number>; // Element size on screen
  visibleSize: SizeVector<number>; // Expected visible area
  elementSize: SizeVector<number>; // Real dimensions, eg Resolution
  offset: Vector<number>; // Translation values
};

export const getVisibleRect = (options: Options): Rect => {
  'worklet';

  const { scale, canvasSize, visibleSize, elementSize, offset } = options;

  const boundX = (canvasSize.width * scale - visibleSize.width) / 2;
  const boundY = (canvasSize.height * scale - visibleSize.height) / 2;

  const normalizedOffsetX = Math.abs(boundX) + offset.x;
  const normalizedOffsetY = Math.abs(boundY) + offset.y;

  const relativeWidth = visibleSize.width / (canvasSize.width * scale);
  const relativeHeight = visibleSize.height / (canvasSize.height * scale);

  const relativeX = interpolate(
    normalizedOffsetX,
    [0, 2 * boundX],
    [1 - relativeWidth, 0]
  );

  const relativeY = interpolate(
    normalizedOffsetY,
    [0, 2 * boundY],
    [1 - relativeHeight, 0]
  );

  const x = elementSize.width * relativeX;
  const y = elementSize.height * relativeY;
  const width = elementSize.width * relativeWidth;
  const height = elementSize.height * relativeHeight;

  return { x, y, width, height };
};
