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
  SwipeDirection,
} from '../types';
import { useVector } from './useVector';
import getSwipeDirection from '../utils/getSwipeDirection';

type PanCommmonOptions = {
  container: SizeVector<SharedValue<number>>;
  translate: Vector<SharedValue<number>>;
  detectorTranslate: Vector<SharedValue<number>>;
  offset: Vector<SharedValue<number>>;
  panMode: PanMode;
  scale: SharedValue<number>;
  minScale: number;
  maxScale: SharedValue<number>;
  decay?: boolean;
  boundFn: BoundsFuction;
  userCallbacks: Partial<{
    onGestureEnd: () => void;
    onSwipe: (direction: SwipeDirection) => void;
    onPanStart: PanGestureEventCallback;
    onPanEnd: PanGestureEventCallback;
    onOverPanning: (x: number, y: number) => void;
  }>;
};

type PanGestureUpdadeEvent = GestureUpdateEvent<
  PanGestureHandlerEventPayload & PanGestureChangeEventPayload
>;

const DECELERATION = 0.9955;

export const usePanCommons = (options: PanCommmonOptions) => {
  const {
    container,
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
  const position = useVector(0, 0);
  const gestureEnd = useSharedValue<number>(0); // Gimmick value to trigger onGestureEnd callback
  const isWithinBoundX = useSharedValue<boolean>(true);
  const isWithinBoundY = useSharedValue<boolean>(true);

  const onPanStart = (e: PanGestureEvent) => {
    'worklet';

    userCallbacks.onPanStart && runOnJS(userCallbacks.onPanStart)(e);
    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(detectorTranslate.x);
    cancelAnimation(detectorTranslate.y);

    offset.x.value = translate.x.value;
    offset.y.value = translate.y.value;

    time.value = performance.now();
    position.x.value = e.absoluteX;
    position.y.value = e.absoluteY;
  };

  const onPanChange = (e: PanGestureUpdadeEvent) => {
    'worklet';

    const toX = e.translationX + offset.x.value;
    const toY = e.translationY + offset.y.value;

    const toScale = clamp(scale.value, minScale, maxScale.value);

    const { x: boundX, y: boundY } = boundFn(toScale);
    const exceedX = Math.max(0, Math.abs(toX) - boundX);
    const exceedY = Math.max(0, Math.abs(toY) - boundY);
    isWithinBoundX.value = exceedX === 0;
    isWithinBoundY.value = exceedY === 0;

    if ((exceedX > 0 || exceedY > 0) && userCallbacks.onOverPanning) {
      const ex = Math.sign(toX) * exceedX;
      const ey = Math.sign(toY) * exceedY;
      userCallbacks.onOverPanning(ex, ey);
    }

    // Simplify both pan modes in one condition due to their similarity
    if (panMode !== PanMode.FRICTION) {
      const isFree = panMode === PanMode.FREE;
      translate.x.value = isFree ? toX : clamp(toX, -1 * boundX, boundX);
      translate.y.value = isFree ? toY : clamp(toY, -1 * boundY, boundY);
      detectorTranslate.x.value = translate.x.value;
      detectorTranslate.y.value = translate.y.value;
    }

    if (panMode === PanMode.FRICTION) {
      const overScrollFraction =
        Math.max(container.width.value, container.height.value) * 1.5;

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
    }
  };

  const onPanEnd = (e: PanGestureEvent) => {
    'worklet';

    if (panMode === PanMode.CLAMP && userCallbacks.onSwipe) {
      const boundaries = boundFn(scale.value);
      const direction = getSwipeDirection(e, {
        boundaries,
        time: time.value,
        position: { x: position.x.value, y: position.y.value },
        translate: { x: translate.x.value, y: translate.y.value },
      });

      if (direction !== undefined) {
        runOnJS(userCallbacks.onSwipe)(direction);
        return;
      }
    }

    userCallbacks.onPanEnd && runOnJS(userCallbacks.onPanEnd)(e);

    const toScale = clamp(scale.value, minScale, maxScale.value);
    const { x: boundX, y: boundY } = boundFn(toScale);
    const clampX: [number, number] = [-1 * boundX, boundX];
    const clampY: [number, number] = [-1 * boundY, boundY];

    const toX = clamp(translate.x.value, -1 * boundX, boundX);
    const toY = clamp(translate.y.value, -1 * boundY, boundY);

    const shouldDecayX = decay && isWithinBoundX.value;
    const shouldDecayY = decay && isWithinBoundY.value;
    const decayConfigX = {
      velocity: e.velocityX,
      clamp: clampX,
      deceleration: DECELERATION,
    };

    const decayConfigY = {
      velocity: e.velocityY,
      clamp: clampY,
      deceleration: DECELERATION,
    };

    detectorTranslate.x.value = translate.x.value;
    detectorTranslate.x.value = shouldDecayX
      ? withDecay(decayConfigX)
      : withTiming(toX);

    translate.x.value = shouldDecayX
      ? withDecay(decayConfigX)
      : withTiming(toX);

    detectorTranslate.y.value = translate.y.value;
    detectorTranslate.y.value = shouldDecayY
      ? withDecay(decayConfigY)
      : withTiming(toY);

    translate.y.value = shouldDecayY
      ? withDecay(decayConfigY)
      : withTiming(toY);

    const restX = Math.max(0, Math.abs(translate.x.value) - boundX);
    const restY = Math.max(0, Math.abs(translate.y.value) - boundY);
    gestureEnd.value = restX > restY ? translate.x.value : translate.y.value;

    if (shouldDecayX && shouldDecayY) {
      const config = restX > restY ? decayConfigX : decayConfigY;
      gestureEnd.value = withDecay(config, (finished) => {
        if (finished && userCallbacks.onGestureEnd) {
          runOnJS(userCallbacks.onGestureEnd)();
        }
      });
    } else {
      const toValue = restX > restY ? toX : toY;
      gestureEnd.value = withTiming(toValue, undefined, (finished) => {
        if (finished && userCallbacks.onGestureEnd) {
          runOnJS(userCallbacks.onGestureEnd)();
        }
      });
    }
  };

  return { onPanStart, onPanChange, onPanEnd };
};
