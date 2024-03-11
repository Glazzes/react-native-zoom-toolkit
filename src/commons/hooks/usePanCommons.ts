import { useWindowDimensions } from 'react-native';
import {
  cancelAnimation,
  clamp,
  withTiming,
  type SharedValue,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';
import type {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { friction } from '../utils/friction';
import { PanMode, type BoundsFuction, type Vector } from '../types';

type PanGestureUpdadeEvent = GestureUpdateEvent<
  PanGestureHandlerEventPayload & PanGestureChangeEventPayload
>;

type PanGestureEnd = GestureStateChangeEvent<PanGestureHandlerEventPayload>;

type PanCommmonOptions = {
  translate: Vector<SharedValue<number>>;
  detectorTranslate: Vector<SharedValue<number>>;
  offset: Vector<SharedValue<number>>;
  panMode: PanMode;
  scale: SharedValue<number>;
  boundFn: BoundsFuction;
  decay?: boolean;
};

export const usePanCommons = (options: PanCommmonOptions) => {
  const { width, height } = useWindowDimensions();

  const {
    translate,
    detectorTranslate,
    offset,
    panMode,
    scale,
    boundFn,
    decay,
  } = options;

  const isWithinBoundX = useSharedValue<boolean>(false);
  const isWithinBoundY = useSharedValue<boolean>(false);

  const onPanStart = () => {
    'worklet';
    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(detectorTranslate.x);
    cancelAnimation(detectorTranslate.y);

    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;
  };

  const onPanChange = (e: PanGestureUpdadeEvent) => {
    'worklet';
    const toX = e.translationX + offset.x.value;
    const toY = e.translationY + offset.y.value;

    if (panMode === PanMode.FREE) {
      translate.x.value = toX;
      translate.y.value = toY;
      return;
    }

    const { x: boundX, y: boundY } = boundFn(scale.value);
    isWithinBoundX.value = toX >= -1 * boundX && toX <= boundX;
    isWithinBoundY.value = toY >= -1 * boundY && toY <= boundY;

    if (panMode === PanMode.FRICTION) {
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

  const onPanEnd = ({ velocityX, velocityY }: PanGestureEnd) => {
    'worklet';

    const { x: boundX, y: boundY } = boundFn(scale.value);
    const toX = clamp(translate.x.value, -1 * boundX, boundX);
    const toY = clamp(translate.y.value, -1 * boundY, boundY);

    if (decay && isWithinBoundX.value) {
      translate.x.value = withDecay(
        {
          velocity: velocityX,
          clamp: [-1 * boundX, boundX],
          deceleration: 0.993,
        },
        () => (detectorTranslate.x.value = translate.x.value)
      );
    } else {
      translate.x.value = withTiming(toX);
      detectorTranslate.x.value = toX;
    }

    if (decay && isWithinBoundY.value) {
      translate.y.value = withDecay(
        {
          velocity: velocityY,
          clamp: [-1 * boundY, boundY],
          deceleration: 0.993,
        },
        () => (detectorTranslate.y.value = translate.y.value)
      );
    } else {
      translate.y.value = withTiming(toY);
      detectorTranslate.y.value = toY;
    }
  };

  return { onPanStart, onPanChange, onPanEnd };
};
