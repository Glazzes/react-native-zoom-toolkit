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
import {
  PanMode,
  type BoundsFuction,
  type Vector,
  type SizeVector,
} from '../types';

type PanGestureUpdadeEvent = GestureUpdateEvent<
  PanGestureHandlerEventPayload & PanGestureChangeEventPayload
>;

type PanGestureEnd = GestureStateChangeEvent<PanGestureHandlerEventPayload>;

type PanCommmonOptions = {
  translate: Vector<SharedValue<number>>;
  detector: SizeVector<SharedValue<number>>;
  detectorTranslate: Vector<SharedValue<number>>;
  offset: Vector<SharedValue<number>>;
  panMode: PanMode;
  scale: SharedValue<number>;
  decay?: boolean;
  boundFn: BoundsFuction;
  onHorizontalBoundsExceeded?: (value: number) => void;
};

const deceleration = 0.994;

export const usePanCommons = (options: PanCommmonOptions) => {
  const {
    detector,
    detectorTranslate,
    translate,
    offset,
    panMode,
    scale,
    decay,
    boundFn,
    onHorizontalBoundsExceeded,
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

    const { x: boundX, y: boundY } = boundFn(scale.value);
    isWithinBoundX.value = toX >= -1 * boundX && toX <= boundX;
    isWithinBoundY.value = toY >= -1 * boundY && toY <= boundY;

    if (!isWithinBoundX.value && onHorizontalBoundsExceeded) {
      const exceededBy = -1 * (toX - Math.sign(toX) * boundX);
      onHorizontalBoundsExceeded(exceededBy);
    }

    if (panMode === PanMode.FREE) {
      translate.x.value = toX;
      translate.y.value = toY;
      return;
    }

    if (panMode === PanMode.FRICTION) {
      const overScrollFraction =
        Math.max(detector.width.value, detector.height.value) * 1.5;

      if (isWithinBoundX) {
        translate.x.value = toX;
      } else {
        const fraction = (Math.abs(toX) - boundX) / overScrollFraction;
        const frictionX = friction(clamp(0, 1, fraction));
        translate.x.value += e.changeX * frictionX;
      }

      if (isWithinBoundY) {
        translate.y.value = toY;
      } else {
        const fraction = (Math.abs(toY) - boundY) / overScrollFraction;
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
      detectorTranslate.x.value = translate.x.value;

      translate.x.value = withDecay({
        velocity: velocityX,
        clamp: [-1 * boundX, boundX],
        deceleration,
      });

      detectorTranslate.x.value = withDecay({
        velocity: velocityX,
        clamp: [-1 * boundX, boundX],
        deceleration,
      });
    } else {
      translate.x.value = withTiming(toX);
      detectorTranslate.x.value = toX;
    }

    if (decay && isWithinBoundY.value) {
      detectorTranslate.y.value = translate.y.value;

      translate.y.value = withDecay({
        velocity: velocityY,
        clamp: [-1 * boundY, boundY],
        deceleration,
      });

      detectorTranslate.y.value = withDecay({
        velocity: velocityY,
        clamp: [-1 * boundY, boundY],
        deceleration,
      });
    } else {
      translate.y.value = withTiming(toY);
      detectorTranslate.y.value = toY;
    }
  };

  return { onPanStart, onPanChange, onPanEnd };
};
