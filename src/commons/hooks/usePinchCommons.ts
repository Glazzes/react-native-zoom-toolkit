import { useState } from 'react';
import {
  withTiming,
  cancelAnimation,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import {
  type GestureUpdateEvent,
  type PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { clamp } from '../utils/clamp';
import { pinchTransform } from '../utils/pinchTransform';
import {
  PanMode,
  ScaleMode,
  type BoundsFuction,
  type SizeVector,
  type Vector,
  type PinchGestureEventCallback,
  type PinchGestureEvent,
} from '../types';

type PinchOptions = {
  container: SizeVector<SharedValue<number>>;
  detectorTranslate: Vector<SharedValue<number>>;
  detectorScale: SharedValue<number>;
  translate: Vector<SharedValue<number>>;
  origin: Vector<SharedValue<number>>;
  offset: Vector<SharedValue<number>>;
  delta: Vector<SharedValue<number>>;
  scale: SharedValue<number>;
  scaleOffset: SharedValue<number>;
  scaleMode: ScaleMode;
  minScale: number;
  maxScale: SharedValue<number>;
  boundFn: BoundsFuction;
  panMode: PanMode;
  allowPinchPanning: boolean;
  userCallbacks: Partial<{
    onGestureEnd: () => void;
    onPinchStart: PinchGestureEventCallback;
    onPinchEnd: PinchGestureEventCallback;
  }>;
};

type PinchGestueUpdateEvent =
  GestureUpdateEvent<PinchGestureHandlerEventPayload>;

export const usePinchCommons = (options: PinchOptions) => {
  const {
    container,
    detectorTranslate,
    detectorScale,
    translate,
    offset,
    delta,
    scale,
    scaleOffset,
    minScale,
    maxScale,
    scaleMode,
    panMode,
    allowPinchPanning,
    origin,
    boundFn,
    userCallbacks,
  } = options;

  const panClamp = panMode === PanMode.CLAMP;
  const scaleClamp = scaleMode === ScaleMode.CLAMP;

  const [gesturesEnabled, setGesturesEnabled] = useState<boolean>(true);
  const switchGesturesState = (value: boolean) => {
    if (scaleMode === ScaleMode.BOUNCE) {
      setGesturesEnabled(value);
    }
  };

  const onPinchStart = (e: PinchGestureEvent) => {
    'worklet';
    runOnJS(switchGesturesState)(false);

    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(detectorTranslate.x);
    cancelAnimation(detectorTranslate.y);
    cancelAnimation(scale);
    cancelAnimation(detectorScale);

    origin.x.value = e.focalX - container.width.value / 2;
    origin.y.value = e.focalY - container.height.value / 2;

    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;
    scaleOffset.value = scale.value;

    if (userCallbacks.onPinchStart) {
      runOnJS(userCallbacks.onPinchStart)(e);
    }
  };

  const onPinchUpdate = (e: PinchGestueUpdateEvent) => {
    'worklet';

    let toScale = e.scale * scaleOffset.value;
    if (scaleClamp) toScale = clamp(toScale, minScale, maxScale.value);

    delta.x.value = e.focalX - container.width.value / 2 - origin.x.value;
    delta.y.value = e.focalY - container.height.value / 2 - origin.y.value;

    const { x: toX, y: toY } = pinchTransform({
      toScale: toScale,
      fromScale: scaleOffset.value,
      origin: { x: origin.x.value, y: origin.y.value },
      offset: { x: offset.x.value, y: offset.y.value },
      delta: {
        x: allowPinchPanning ? delta.x.value * scaleOffset.value : 0,
        y: allowPinchPanning ? delta.y.value * scaleOffset.value : 0,
      },
    });

    const { x: boundX, y: boundY } = boundFn(toScale);
    const clampedX = clamp(toX, -1 * boundX, boundX);
    const clampedY = clamp(toY, -1 * boundY, boundY);

    translate.x.value = panClamp ? clampedX : toX;
    translate.y.value = panClamp ? clampedY : toY;
    scale.value = toScale;
  };

  const reset = (toX: number, toY: number, toScale: number) => {
    'worklet';

    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(scale);

    const { x: bx, y: by } = boundFn(scale.value);
    const inBoundX = translate.x.value >= -1 * bx && translate.x.value <= bx;
    const inBoundY = translate.y.value >= -1 * by && translate.y.value <= by;

    detectorTranslate.x.value = translate.x.value;
    detectorTranslate.y.value = translate.y.value;
    detectorScale.value = scale.value;
    detectorTranslate.x.value = withTiming(toX);
    detectorTranslate.y.value = withTiming(toY);
    detectorScale.value = withTiming(toScale);

    translate.x.value = withTiming(toX, undefined, (finished) => {
      if (finished && !inBoundX && userCallbacks.onGestureEnd) {
        runOnJS(userCallbacks.onGestureEnd)();
      }
    });

    translate.y.value = withTiming(toY, undefined, (finished) => {
      if (finished && !inBoundY && inBoundX && userCallbacks.onGestureEnd) {
        runOnJS(userCallbacks.onGestureEnd)();
      }
    });

    scale.value = withTiming(toScale, undefined, (finished) => {
      runOnJS(switchGesturesState)(true);
      if (finished && inBoundX && inBoundY && userCallbacks.onGestureEnd) {
        runOnJS(userCallbacks.onGestureEnd)();
      }
    });
  };

  const onPinchEnd = (e: PinchGestureEvent) => {
    'worklet';

    if (userCallbacks.onPinchEnd) {
      runOnJS(userCallbacks.onPinchEnd)(e);
    }

    if (scale.value < minScale && scaleMode === ScaleMode.BOUNCE) {
      const { x: boundX, y: boundY } = boundFn(minScale);
      const toX = clamp(translate.x.value, -1 * boundX, boundX);
      const toY = clamp(translate.y.value, -1 * boundY, boundY);

      reset(toX, toY, minScale);
      return;
    }

    if (scale.value > maxScale.value && scaleMode === ScaleMode.BOUNCE) {
      const scaleDiff = Math.max(
        0,
        scaleOffset.value - (scale.value - scaleOffset.value) / 2
      );

      const { x, y } = pinchTransform({
        toScale: maxScale.value,
        fromScale: scale.value,
        origin: { x: origin.x.value, y: origin.y.value },
        offset: { x: translate.x.value, y: translate.y.value },
        delta: { x: 0, y: allowPinchPanning ? -delta.y.value * scaleDiff : 0 },
      });

      const { x: boundX, y: boundY } = boundFn(maxScale.value);
      const toX = clamp(x, -1 * boundX, boundX);
      const toY = clamp(y, -1 * boundY, boundY);
      reset(toX, toY, maxScale.value);

      return;
    }

    const { x: boundX, y: boundY } = boundFn(scale.value);
    const toX = clamp(translate.x.value, -1 * boundX, boundX);
    const toY = clamp(translate.y.value, -1 * boundY, boundY);

    reset(toX, toY, scale.value);
  };

  return { gesturesEnabled, onPinchStart, onPinchUpdate, onPinchEnd };
};
