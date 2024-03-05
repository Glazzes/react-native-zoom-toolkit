import {
  clamp,
  withTiming,
  type SharedValue,
  cancelAnimation,
} from 'react-native-reanimated';
import type { BoundsFuction, ScaleMode, SizeVector, Vector } from '../types';
import type {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { pinchTransform } from '../utils/pinchTransform';

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
  maxScale: SharedValue<number>;
  boundFn: BoundsFuction;
  panWithPinch?: boolean;
};

type PinchGestureEvent =
  GestureStateChangeEvent<PinchGestureHandlerEventPayload>;

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
    maxScale,
    scaleMode,
    panWithPinch,
    origin,
    boundFn,
  } = options;

  const onPinchStart = (e: PinchGestureEvent) => {
    'worklet';
    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(scale);

    origin.x.value = e.focalX - detector.width.value / 2;
    origin.y.value = e.focalY - detector.height.value / 2;

    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;
    scaleOffset.value = scale.value;
  };

  const onPinchUpdate = (e: PinchGestueUpdateEvent) => {
    'worklet';
    let toScale = e.scale * scaleOffset.value;
    if (scaleMode === 'clamp') {
      toScale = clamp(toScale, 0, maxScale.value);
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

    translate.x.value = toX;
    translate.y.value = toY;
    scale.value = toScale;
  };

  const onPinchEnd = () => {
    'worklet';
    if (scale.value < 1) {
      translate.x.value = withTiming(0);
      translate.y.value = withTiming(0);
      scale.value = withTiming(1);

      detectorTranslate.x.value = 0;
      detectorTranslate.y.value = 0;
      detectorScale.value = 1;
      return;
    }

    if (scale.value > maxScale.value && scaleMode === 'bounce') {
      const scaleDiff = scale.value / scaleOffset.value;

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

      translate.x.value = withTiming(toX);
      translate.y.value = withTiming(toY);
      scale.value = withTiming(maxScale.value);

      detectorTranslate.x.value = toX;
      detectorTranslate.y.value = toY;
      detectorScale.value = maxScale.value;
      return;
    }

    const { x: boundX, y: boundY } = boundFn(scale.value);
    const toX = clamp(translate.x.value, -1 * boundX, boundX);
    const toY = clamp(translate.y.value, -1 * boundY, boundY);

    translate.x.value = withTiming(toX);
    translate.y.value = withTiming(toY);

    detectorTranslate.x.value = toX;
    detectorTranslate.y.value = toY;
    detectorScale.value = scale.value;
  };

  return { onPinchStart, onPinchUpdate, onPinchEnd };
};
