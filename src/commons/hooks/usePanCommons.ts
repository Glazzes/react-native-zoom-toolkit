import {
  cancelAnimation,
  clamp,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { BoundsFuction, PanMode, Vector } from '../types';
import type {
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { friction } from '../utils/friction';
import { useWindowDimensions } from 'react-native';

type PanGestureUpdadeEvent = GestureUpdateEvent<
  PanGestureHandlerEventPayload & PanGestureChangeEventPayload
>;

type PanCommmonOptions = {
  translate: Vector<SharedValue<number>>;
  detectorTranslate: Vector<SharedValue<number>>;
  offset: Vector<SharedValue<number>>;
  panMode: PanMode;
  scale: SharedValue<number>;
  detectorScale: SharedValue<number>;
  boundFn: BoundsFuction;
};

export const usePanCommons = (options: PanCommmonOptions) => {
  const { width, height } = useWindowDimensions();

  const {
    translate,
    detectorTranslate,
    offset,
    panMode,
    scale,
    detectorScale,
    boundFn,
  } = options;

  const onPanStart = () => {
    'worklet';
    cancelAnimation(translate.x);
    cancelAnimation(translate.y);

    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;
  };

  const onChange = (e: PanGestureUpdadeEvent) => {
    'worklet';
    const toX = e.translationX + offset.x.value;
    const toY = e.translationY + offset.y.value;

    if (panMode === 'free') {
      translate.x.value = toX;
      translate.y.value = toY;
      return;
    }

    const { x: boundX, y: boundY } = boundFn(scale.value);
    const isWithinBoundX = toX >= -1 * boundX && toX <= boundX;
    const isWithinBoundY = toY >= -1 * boundY && toY <= boundY;
    if (panMode === 'friction') {
      if (isWithinBoundX) {
        translate.x.value = toX;
      } else {
        const fraction = (Math.abs(toX) - boundX) / width;
        const frictionX = friction(clamp(0, 1, fraction));
        translate.x.value += e.changeX * frictionX;
      }

      if (isWithinBoundY) {
        translate.y.value = toY;
      } else {
        const fraction = (Math.abs(toY) - boundY) / height;
        const frictionY = friction(clamp(0, 1, fraction));
        translate.y.value += e.changeY * frictionY;
      }

      return;
    }

    translate.x.value = clamp(toX, -1 * boundX, boundX);
    translate.y.value = clamp(toY, -1 * boundY, boundY);
  };

  const onPanEnd = () => {
    'worklet';
    const { x: boundX, y: boundY } = boundFn(scale.value);
    const toX = clamp(translate.x.value, -1 * boundX, boundX);
    const toY = clamp(translate.y.value, -1 * boundY, boundY);

    detectorTranslate.x.value = toX;
    detectorTranslate.y.value = toY;
    detectorScale.value = scale.value;

    translate.x.value = withTiming(toX);
    translate.y.value = withTiming(toY);
  };

  return { onPanStart, onChange, onPanEnd };
};
