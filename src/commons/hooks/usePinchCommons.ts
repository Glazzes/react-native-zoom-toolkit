import { useState } from 'react';
import {
  withTiming,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import {
  type GestureUpdateEvent,
  type PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { clamp } from '../utils/clamp';
import { pinchTransform } from '../utils/pinchTransform';
import {
  ScaleMode,
  PinchCenteringMode,
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
  pinchCenteringMode: PinchCenteringMode;
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
    pinchCenteringMode,
    allowPinchPanning,
    origin,
    boundFn,
    userCallbacks,
  } = options;

  const pinchClamp = pinchCenteringMode === PinchCenteringMode.CLAMP;
  const scaleClamp = scaleMode === ScaleMode.CLAMP;

  // This value is used to trigger the onGestureEnd callback as a gimmick to avoid unneccesary calculations.
  const gestureEnd = useSharedValue<number>(0);

  const [gesturesEnabled, setGesturesEnabled] = useState<boolean>(true);
  const switchGesturesState = (value: boolean) => {
    if (scaleMode !== ScaleMode.BOUNCE) return;
    setGesturesEnabled(value);
  };

  const onPinchStart = (e: PinchGestureEvent) => {
    'worklet';
    runOnJS(switchGesturesState)(false);
    userCallbacks.onPinchStart && runOnJS(userCallbacks.onPinchStart)(e);

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

    translate.x.value = pinchClamp ? clampedX : toX;
    translate.y.value = pinchClamp ? clampedY : toY;
    scale.value = toScale;
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

    const areTXNotEqual = translate.x.value !== toX;
    const areTYNotEqual = translate.y.value !== toY;
    const areScalesNotEqual = scale.value !== toScale;
    const toValue = areTXNotEqual || areTYNotEqual || areScalesNotEqual ? 1 : 0;

    translate.x.value = withTiming(toX);
    translate.y.value = withTiming(toY);
    scale.value = withTiming(toScale, undefined, (finished) => {
      finished && runOnJS(switchGesturesState)(true);
    });

    gestureEnd.value = withTiming(toValue, undefined, (finished) => {
      gestureEnd.value = 0;
      if (finished && userCallbacks.onGestureEnd !== undefined) {
        runOnJS(userCallbacks.onGestureEnd)();
      }
    });
  };

  const onPinchEnd = (e: PinchGestureEvent) => {
    'worklet';

    userCallbacks.onPinchEnd && runOnJS(userCallbacks.onPinchEnd)(e);

    const toScale = clamp(scale.value, minScale, maxScale.value);
    const scaleDiff =
      scaleMode === ScaleMode.BOUNCE && scale.value > maxScale.value
        ? Math.max(0, scaleOffset.value - (scale.value - scaleOffset.value) / 2)
        : 0;

    const { x, y } = pinchTransform({
      toScale: toScale,
      fromScale: scale.value,
      origin: { x: origin.x.value, y: origin.y.value },
      offset: { x: translate.x.value, y: translate.y.value },
      delta: { x: 0, y: allowPinchPanning ? -delta.y.value * scaleDiff : 0 },
    });

    const { x: boundX, y: boundY } = boundFn(toScale);
    const toX = clamp(x, -1 * boundX, boundX);
    const toY = clamp(y, -1 * boundY, boundY);

    reset(toX, toY, toScale);
  };

  return { gesturesEnabled, onPinchStart, onPinchUpdate, onPinchEnd };
};
