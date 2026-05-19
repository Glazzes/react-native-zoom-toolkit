import { useState } from 'react';

import { clamp, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { pinchTransform } from '../utils/pinchTransform';
import type {
  BoundsFuction,
  Size,
  TapGestureEvent,
  TapGestureEventCallback,
  Vector,
} from '../types';

type DoubleTapOptions = {
  container: Size<SharedValue<number>>;
  translate: Vector<SharedValue<number>>;
  scale: SharedValue<number>;
  minScale: number;
  maxScale: SharedValue<number>;
  boundsFn: BoundsFuction;
  onGestureEnd?: () => void;
  onTapStart?: TapGestureEventCallback;
  onTapEnd?: TapGestureEventCallback;
};

export const useDoubleTapCommons = ({
  container,
  translate,
  scale,
  minScale,
  maxScale,
  boundsFn,
  onTapStart,
  onTapEnd,
  onGestureEnd,
}: DoubleTapOptions) => {
  const [isPanGestureEnabled, setIsPanGestureEnabled] = useState<boolean>(true);

  const onDoubleTapStart = (event: TapGestureEvent) => {
    'worklet';
    scheduleOnRN(setIsPanGestureEnabled, false);
    if (onTapStart !== undefined) {
      scheduleOnRN(onTapStart, event);
    }
  };

  const onDoubleTapEnd = (event: TapGestureEvent) => {
    'worklet';

    const originX = event.x - container.width.value / 2;
    const originY = event.y - container.height.value / 2;
    const toScale =
      scale.value >= maxScale.value * 0.8 ? minScale : maxScale.value;

    const { x, y } = pinchTransform({
      toScale: toScale,
      fromScale: scale.value,
      origin: { x: originX, y: originY },
      delta: { x: 0, y: 0 },
      offset: { x: translate.x.value, y: translate.y.value },
    });

    const { x: boundX, y: boundY } = boundsFn(toScale);
    const toX = clamp(x, -1 * boundX, boundX);
    const toY = clamp(y, -1 * boundY, boundY);

    translate.x.value = withTiming(toX);
    translate.y.value = withTiming(toY);
    scale.value = withTiming(toScale, undefined, (finished) => {
      scheduleOnRN(setIsPanGestureEnabled, true);
      if (finished && onGestureEnd !== undefined) {
        scheduleOnRN(onGestureEnd);
      }

      if (finished && onTapEnd !== undefined) {
        scheduleOnRN(onTapEnd, event);
      }
    });
  };

  return {
    onDoubleTapStart,
    onDoubleTapEnd,
    enablePanGestureByDoubleTap: isPanGestureEnabled,
  };
};
