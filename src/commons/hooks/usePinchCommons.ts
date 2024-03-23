import {
  withTiming,
  cancelAnimation,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import type {
  GestureUpdateEvent,
  PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { clamp } from '../utils/clamp';
import { pinchTransform } from '../utils/pinchTransform';

import {
  ScaleMode,
  type BoundsFuction,
  type SizeVector,
  type Vector,
  type PinchGestureEventCallback,
  type PinchGestureEvent,
  PanMode,
} from '../types';
import { useState } from 'react';

type PinchOptions = {
  detector: SizeVector<SharedValue<number>>;
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
  panMode?: PanMode;
  panWithPinch?: boolean;
  userCallbacks?: Partial<{
    onPinchStart: PinchGestureEventCallback;
    onPinchEnd: PinchGestureEventCallback;
  }>;
};

type PinchGestueUpdateEvent =
  GestureUpdateEvent<PinchGestureHandlerEventPayload>;

export const usePinchCommons = (options: PinchOptions) => {
  const {
    detector,
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
    panWithPinch,
    origin,
    boundFn,
    userCallbacks,
  } = options;

  const [gesturesEnabled, setGesturesEnabled] = useState<boolean>(true);
  const toggleGestures = () => {
    if (scaleMode === ScaleMode.BOUNCE) {
      setGesturesEnabled((prev) => !prev);
    }
  };

  const reset = (toX: number, toY: number, toScale: number) => {
    'worklet';

    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(scale);

    detectorTranslate.x.value = translate.x.value;
    detectorTranslate.y.value = translate.y.value;
    detectorScale.value = scale.value;

    detectorTranslate.x.value = withTiming(toX);
    detectorTranslate.y.value = withTiming(toY);
    detectorScale.value = withTiming(toScale);
    translate.x.value = withTiming(toX);
    translate.y.value = withTiming(toY);
    scale.value = withTiming(toScale, undefined, () => {
      runOnJS(toggleGestures)();
    });
  };

  const onPinchStart = (e: PinchGestureEvent) => {
    'worklet';

    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(detectorTranslate.x);
    cancelAnimation(detectorTranslate.y);
    cancelAnimation(scale);
    cancelAnimation(detectorScale);

    origin.x.value = e.focalX - detector.width.value / 2;
    origin.y.value = e.focalY - detector.height.value / 2;

    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;
    scaleOffset.value = scale.value;

    if (userCallbacks?.onPinchStart) {
      runOnJS(userCallbacks.onPinchStart)(e);
    }
  };

  const onPinchUpdate = (e: PinchGestueUpdateEvent) => {
    'worklet';

    let toScale = e.scale * scaleOffset.value;
    if (scaleMode === ScaleMode.CLAMP) {
      toScale = clamp(toScale, minScale, maxScale.value);
    }

    delta.x.value = e.focalX - detector.width.value / 2 - origin.x.value;
    delta.y.value = e.focalY - detector.height.value / 2 - origin.y.value;

    const { x: toX, y: toY } = pinchTransform({
      toScale: toScale,
      fromScale: scaleOffset.value,
      origin: { x: origin.x.value, y: origin.y.value },
      offset: { x: offset.x.value, y: offset.y.value },
      delta: {
        x: panWithPinch ? delta.x.value * scaleOffset.value : 0,
        y: panWithPinch ? delta.y.value * scaleOffset.value : 0,
      },
    });

    const { x: boundX } = boundFn(toScale);
    const clampedX = clamp(toX, -1 * boundX, boundX);

    translate.x.value = panMode === PanMode.CLAMP ? clampedX : toX;
    translate.y.value = toY;
    scale.value = toScale;
  };

  const onPinchEnd = (e: PinchGestureEvent) => {
    'worklet';

    runOnJS(toggleGestures)();

    if (userCallbacks?.onPinchEnd) {
      runOnJS(userCallbacks.onPinchEnd)(e);
    }

    if (scale.value < minScale && scaleMode === ScaleMode.BOUNCE) {
      reset(0, 0, minScale);
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
        delta: {
          x: 0,
          y: panWithPinch ? -1 * delta.y.value * scaleDiff : 0,
        },
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
