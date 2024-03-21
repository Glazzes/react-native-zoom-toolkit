import {
  cancelAnimation,
  withTiming,
  useSharedValue,
  withDecay,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import type {
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { clamp } from '../utils/clamp';
import { friction } from '../utils/friction';

import {
  PanMode,
  type BoundsFuction,
  type Vector,
  type SizeVector,
  type PanGestureEventCallback,
  type PanGestureEvent,
} from '../types';

type PanCommmonOptions = {
  translate: Vector<SharedValue<number>>;
  detector: SizeVector<SharedValue<number>>;
  detectorTranslate: Vector<SharedValue<number>>;
  offset: Vector<SharedValue<number>>;
  panMode: PanMode;
  scale: SharedValue<number>;
  minScale: number;
  maxScale: SharedValue<number>;
  decay?: boolean;
  boundFn: BoundsFuction;
  userCallbacks?: Partial<{
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    onPanStart: PanGestureEventCallback;
    onPanEnd: PanGestureEventCallback;
    onHorizontalBoundsExceeded: (value: number) => void;
  }>;
};

type PanGestureUpdadeEvent = GestureUpdateEvent<
  PanGestureHandlerEventPayload & PanGestureChangeEventPayload
>;

const DECELERATION = 0.994;

export const usePanCommons = (options: PanCommmonOptions) => {
  const {
    detector,
    detectorTranslate,
    translate,
    offset,
    panMode,
    scale,
    minScale,
    maxScale,
    decay,
    boundFn,
    userCallbacks,
  } = options;

  const time = useSharedValue<number>(0);
  const x = useSharedValue<number>(0);

  const isWithinBoundX = useSharedValue<boolean>(true);
  const isWithinBoundY = useSharedValue<boolean>(true);

  const onPanStart = (e: PanGestureEvent) => {
    'worklet';

    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(detectorTranslate.x);
    cancelAnimation(detectorTranslate.y);

    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;

    time.value = performance.now();
    x.value = e.absoluteX;

    if (userCallbacks?.onPanStart) {
      runOnJS(userCallbacks.onPanStart)(e);
    }
  };

  const onPanChange = (e: PanGestureUpdadeEvent) => {
    'worklet';
    const toX = e.translationX + offset.x.value;
    const toY = e.translationY + offset.y.value;

    const { x: boundX, y: boundY } = boundFn(scale.value);
    isWithinBoundX.value = toX >= -1 * boundX && toX <= boundX;
    isWithinBoundY.value = toY >= -1 * boundY && toY <= boundY;

    if (
      !isWithinBoundX.value &&
      userCallbacks?.onHorizontalBoundsExceeded &&
      panMode === PanMode.CLAMP
    ) {
      const exceededBy = -1 * (toX - Math.sign(toX) * boundX);
      userCallbacks.onHorizontalBoundsExceeded(exceededBy);
    }

    if (panMode === PanMode.FREE) {
      translate.x.value = toX;
      translate.y.value = toY;
      detectorTranslate.x.value = toX;
      detectorTranslate.y.value = toY;
      return;
    }

    if (panMode === PanMode.CLAMP) {
      translate.x.value = clamp(toX, -1 * boundX, boundX);
      translate.y.value = clamp(toY, -1 * boundY, boundY);
      detectorTranslate.x.value = clamp(toX, -1 * boundX, boundX);
      detectorTranslate.y.value = clamp(toX, -1 * boundY, boundY);
      return;
    }

    if (panMode === PanMode.FRICTION) {
      const overScrollFraction =
        Math.max(detector.width.value, detector.height.value) * 1.5;

      if (isWithinBoundX.value) {
        translate.x.value = toX;
      } else {
        const fraction = Math.abs(Math.abs(toX) - boundX) / overScrollFraction;
        const frictionX = friction(clamp(fraction, 0, 1));
        translate.x.value += e.changeX * frictionX;
      }

      if (isWithinBoundY.value) {
        translate.y.value = toY;
      } else {
        const fraction = Math.abs(Math.abs(toY) - boundY) / overScrollFraction;
        const frictionY = friction(clamp(fraction, 0, 1));
        translate.y.value += e.changeY * frictionY;
      }

      return;
    }
  };

  const onPanEnd = (e: PanGestureEvent) => {
    'worklet';

    const canSwipe = scale.value === minScale && panMode === PanMode.CLAMP;

    const velocity = Math.abs(e.velocityX);
    const deltaTime = Math.abs(performance.now() - time.value);
    const deltaX = Math.abs(x.value - e.absoluteX);
    const direction = Math.sign(e.absoluteX - x.value);

    if (velocity >= 500 && deltaX >= 20 && deltaTime < 175 && canSwipe) {
      if (direction === -1 && userCallbacks?.onSwipeLeft) {
        runOnJS(userCallbacks.onSwipeLeft)();
        return;
      }

      if (direction === 1 && userCallbacks?.onSwipeRight) {
        runOnJS(userCallbacks.onSwipeRight)();
        return;
      }
    }

    /*
     * In fucked up phones like mine its possible to trigger a pan gesture in the middle of a pinch
     * gesture somehow, this resulting in the picture being displaced from the desired boundaries,
     * therefore I've had to clamp the final scale in order to prevent this behavior.
     */
    const toScale = clamp(scale.value, minScale, maxScale.value);

    const { x: boundX, y: boundY } = boundFn(toScale);
    const clampX: [number, number] = [-1 * boundX, boundX];
    const clampY: [number, number] = [-1 * boundY, boundY];

    const toX = clamp(translate.x.value, -1 * boundX, boundX);
    const toY = clamp(translate.y.value, -1 * boundY, boundY);

    if (decay && isWithinBoundX.value) {
      detectorTranslate.x.value = translate.x.value;

      translate.x.value = withDecay({
        velocity: e.velocityX,
        clamp: clampX,
        deceleration: DECELERATION,
      });

      detectorTranslate.x.value = withDecay({
        velocity: e.velocityX,
        clamp: clampX,
        deceleration: DECELERATION,
      });
    } else {
      translate.x.value = withTiming(toX);
      detectorTranslate.x.value = withTiming(toX);
    }

    if (decay && isWithinBoundY.value) {
      detectorTranslate.y.value = translate.y.value;

      translate.y.value = withDecay({
        velocity: e.velocityY,
        clamp: clampY,
        deceleration: DECELERATION,
      });

      detectorTranslate.y.value = withDecay({
        velocity: e.velocityY,
        clamp: clampY,
        deceleration: DECELERATION,
      });
    } else {
      translate.y.value = withTiming(toY);
      detectorTranslate.y.value = withTiming(toY);
    }

    if (userCallbacks?.onPanEnd) {
      runOnJS(userCallbacks.onPanEnd)(e);
    }
  };

  return { onPanStart, onPanChange, onPanEnd };
};
