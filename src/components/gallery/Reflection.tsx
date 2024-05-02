import React, { useState } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { clamp } from '../../commons/utils/clamp';
import { pinchTransform } from '../../commons/utils/pinchTransform';
import { useVector } from '../../commons/hooks/useVector';
import type {
  BoundsFuction,
  PanGestureEvent,
  SizeVector,
  TapGestureEvent,
  Vector,
} from '../../commons/types';
import { snapPoint } from '../../commons/utils/snapPoint';

const minScale = 1;
const config = { duration: 300, easing: Easing.linear };

type ReflectionProps = {
  activeIndex: SharedValue<number>;
  resetIndex: SharedValue<number>;
  fetchIndex: SharedValue<number>;
  length: number;
  rootSize: SizeVector<SharedValue<number>>;
  rootChild: SizeVector<SharedValue<number>>;
  scroll: SharedValue<number>;
  scrollOffset: SharedValue<number>;
  translate: Vector<SharedValue<number>>;
  scale: SharedValue<number>;
  maxScale: SharedValue<number>;
  isScrolling: SharedValue<boolean>;
  tapOnEdgeToItem: boolean;
  allowPinchPanning: boolean;
  onTap?: (e: TapGestureEvent, index: number) => void;
};

const Reflection = ({
  activeIndex,
  resetIndex,
  fetchIndex,
  length,
  rootSize,
  rootChild,
  scroll,
  scrollOffset,
  translate,
  scale,
  maxScale,
  isScrolling,
  tapOnEdgeToItem,
  allowPinchPanning,
  onTap,
}: ReflectionProps) => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const toggleGestures = (value: boolean) => setEnabled(value);

  const offset = useVector(0, 0);
  const origin = useVector(0, 0);
  const delta = useVector(0, 0);
  const scaleOffset = useSharedValue<number>(1);

  const detectorTranslate = useVector(0, 0);
  const detectorScale = useSharedValue<number>(1);

  const time = useSharedValue<number>(0);
  const absX = useSharedValue<number>(0);

  const boundsFn: BoundsFuction = (scaleValue) => {
    'worklet';

    const { width: cWidth, height: cHeight } = rootChild;
    const { width: rWidth, height: rHeight } = rootSize;

    const boundX = Math.max(0, cWidth.value * scaleValue - rWidth.value) / 2;
    const boundY = Math.max(0, cHeight.value * scaleValue - rHeight.value) / 2;
    return { x: boundX, y: boundY };
  };

  const reset = (
    toX: number,
    toY: number,
    toScale: number,
    animate: boolean = true
  ) => {
    'worklet';

    detectorTranslate.x.value = translate.x.value;
    detectorTranslate.y.value = translate.y.value;
    detectorScale.value = scale.value;

    translate.x.value = animate ? withTiming(toX) : toX;
    translate.y.value = animate ? withTiming(toY) : toY;
    scale.value = animate ? withTiming(toScale) : toScale;
    detectorTranslate.x.value = animate ? withTiming(toX) : toX;
    detectorTranslate.y.value = animate ? withTiming(toY) : toY;
    detectorScale.value = animate
      ? withTiming(toScale, undefined, () => {
          runOnJS(toggleGestures)(true);
        })
      : toScale;
  };

  const clampScroll = (value: number) => {
    'worklet';
    return clamp(value, 0, (length - 1) * rootSize.width.value);
  };

  const onPanEnd = (e: PanGestureEvent) => {
    'worklet';
    const index = activeIndex.value;

    const prev = rootSize.width.value * (index - 1);
    const current = rootSize.width.value * index;
    const next = rootSize.width.value * (index + 1);

    const points = scroll.value >= current ? [current, next] : [prev, current];
    const to = clampScroll(snapPoint(scroll.value, e.velocityX, points));

    if (to !== current) {
      fetchIndex.value = index + (to === next ? 1 : -1);
    }

    scroll.value = withTiming(to, config, () => {
      if (to !== current) {
        activeIndex.value = index + (to === next ? 1 : -1);
        isScrolling.value = false;
      }
    });
  };

  const onSwipe = (direction: 'right' | 'left') => {
    'worklet';
    const index = activeIndex.value;

    const toIndex = index + (direction === 'right' ? -1 : 1);
    if (toIndex < 0 || toIndex > length - 1) return;

    fetchIndex.value = toIndex;

    const to = clampScroll(toIndex * rootSize.width.value);

    scroll.value = withTiming(to, config, (finished) => {
      activeIndex.value = toIndex;
      if (finished) isScrolling.value = false;
    });
  };

  useAnimatedReaction(
    () => rootSize.width.value,
    () => reset(0, 0, minScale, false),
    [rootSize]
  );

  useAnimatedReaction(
    () => activeIndex.value,
    () => reset(0, 0, minScale, false),
    [activeIndex]
  );

  useAnimatedReaction(
    () => resetIndex.value,
    () => reset(0, 0, minScale, false),
    [resetIndex]
  );

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      runOnJS(toggleGestures)(false);

      cancelAnimation(translate.x);
      cancelAnimation(translate.y);
      cancelAnimation(detectorTranslate.x);
      cancelAnimation(detectorTranslate.y);
      cancelAnimation(scale);
      cancelAnimation(detectorScale);

      origin.x.value = e.focalX - rootSize.width.value / 2;
      origin.y.value = e.focalY - rootSize.height.value / 2;

      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
      scaleOffset.value = scale.value;
    })
    .onUpdate((e) => {
      const toScale = e.scale * scaleOffset.value;
      delta.x.value = e.focalX - rootSize.width.value / 2 - origin.x.value;
      delta.y.value = e.focalY - rootSize.height.value / 2 - origin.y.value;

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

      const { x: boundX, y: boundY } = boundsFn(toScale);
      translate.x.value = clamp(toX, -1 * boundX, boundX);
      translate.y.value = clamp(toY, -1 * boundY, boundY);
      scale.value = toScale;
    })
    .onEnd(() => {
      if (scale.value < minScale) {
        const { x: boundX, y: boundY } = boundsFn(minScale);
        const toX = clamp(translate.x.value, -1 * boundX, boundX);
        const toY = clamp(translate.y.value, -1 * boundY, boundY);

        reset(toX, toY, minScale);
        return;
      }

      if (scale.value > maxScale.value) {
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
            y: allowPinchPanning ? -1 * delta.y.value * scaleDiff : 0,
          },
        });

        const { x: boundX, y: boundY } = boundsFn(maxScale.value);
        const toX = clamp(x, -1 * boundX, boundX);
        const toY = clamp(y, -1 * boundY, boundY);
        reset(toX, toY, maxScale.value);

        return;
      }

      const { x: boundX, y: boundY } = boundsFn(scale.value);
      const toX = clamp(translate.x.value, -1 * boundX, boundX);
      const toY = clamp(translate.y.value, -1 * boundY, boundY);
      reset(toX, toY, scale.value);
    });

  const isWithinBoundX = useSharedValue<boolean>(true);
  const isWithinBoundY = useSharedValue<boolean>(true);

  const pan = Gesture.Pan()
    .maxPointers(1)
    .enabled(enabled)
    .onStart((e) => {
      isScrolling.value = true;
      time.value = performance.now();
      absX.value = e.absoluteX;
      scrollOffset.value = scroll.value;

      cancelAnimation(translate.x);
      cancelAnimation(translate.y);
      cancelAnimation(detectorTranslate.x);
      cancelAnimation(detectorTranslate.y);

      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onUpdate(({ translationX, translationY }) => {
      const toX = offset.x.value + translationX;
      const toY = offset.y.value + translationY;
      const { x: boundX, y: boundY } = boundsFn(scale.value);

      isWithinBoundX.value = toX >= -1 * boundX && toX <= boundX;
      isWithinBoundY.value = toX >= -1 * boundY && toY <= boundY;

      if (!isWithinBoundX.value) {
        const exceededBy = -1 * (toX - Math.sign(toX) * boundX);
        scroll.value = clamp(
          scrollOffset.value + exceededBy,
          0,
          (length - 1) * rootSize.width.value
        );
      }

      translate.x.value = clamp(toX, -1 * boundX, boundX);
      translate.y.value = clamp(toY, -1 * boundY, boundY);
      detectorTranslate.x.value = clamp(toX, -1 * boundX, boundX);
      detectorTranslate.y.value = clamp(toY, -1 * boundY, boundY);
    })
    .onEnd((e) => {
      const velocity = Math.abs(e.velocityX);
      const deltaTime = performance.now() - time.value;
      const deltaX = Math.abs(absX.value - e.absoluteX);

      const didSwipe = velocity >= 500 && deltaX >= 20 && deltaTime < 175;
      if (didSwipe) {
        const { x: boundX } = boundsFn(scale.value);
        const direction = Math.sign(e.absoluteX - absX.value);

        const inLeftEdge = translate.x.value === -1 * boundX;
        if (direction === -1 && inLeftEdge) {
          onSwipe('left');
          return;
        }

        const inRightEdge = translate.x.value === boundX;
        if (direction === 1 && inRightEdge) {
          onSwipe('right');
          return;
        }
      }

      onPanEnd(e);

      const { x: boundX, y: boundY } = boundsFn(scale.value);
      const clampX: [number, number] = [-1 * boundX, boundX];
      const clampY: [number, number] = [-1 * boundY, boundY];

      translate.x.value = withDecay({ velocity: e.velocityX, clamp: clampX });
      detectorTranslate.x.value = withDecay({
        velocity: e.velocityX,
        clamp: clampX,
      });

      translate.y.value = withDecay({ velocity: e.velocityY, clamp: clampY });
      detectorTranslate.y.value = withDecay({
        velocity: e.velocityY,
        clamp: clampY,
      });
    });

  const tap = Gesture.Tap()
    .enabled(enabled)
    .numberOfTaps(1)
    .maxDuration(250)
    .runOnJS(true)
    .onEnd((e) => {
      let toIndex = activeIndex.value;
      if (e.x <= 44 && tapOnEdgeToItem) toIndex = activeIndex.value - 1;
      if (e.x >= rootSize.width.value - 44 && tapOnEdgeToItem)
        toIndex = activeIndex.value + 1;

      if (toIndex === activeIndex.value) {
        onTap?.(e, activeIndex.value);
        return;
      }

      toIndex = clamp(toIndex, 0, length - 1);
      scroll.value = toIndex * rootSize.width.value;
      activeIndex.value = toIndex;
      fetchIndex.value = toIndex;
    });

  const doubleTap = Gesture.Tap()
    .enabled(enabled)
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((e) => {
      if (scale.value >= maxScale.value * 0.8) {
        reset(0, 0, minScale);
        return;
      }

      const originX = e.x - rootSize.width.value / 2;
      const originY = e.y - rootSize.height.value / 2;

      const { x, y } = pinchTransform({
        toScale: maxScale.value,
        fromScale: scale.value,
        origin: { x: originX, y: originY },
        delta: { x: 0, y: 0 },
        offset: { x: translate.x.value, y: translate.y.value },
      });

      const { x: boundX, y: boundY } = boundsFn(maxScale.value);
      const toX = clamp(x, -1 * boundX, boundX);
      const toY = clamp(y, -1 * boundY, boundY);
      reset(toX, toY, maxScale.value);
    });

  const detectorStyle = useAnimatedStyle(() => ({
    width: rootSize.width.value,
    height: rootSize.height.value,
    position: 'absolute',
    zIndex: Number.MAX_SAFE_INTEGER,
    transform: [
      { translateX: detectorTranslate.x.value },
      { translateY: detectorTranslate.y.value },
      { scale: detectorScale.value },
    ],
  }));

  return (
    <GestureDetector
      gesture={Gesture.Race(pan, pinch, Gesture.Exclusive(doubleTap, tap))}
    >
      <Animated.View style={detectorStyle} />
    </GestureDetector>
  );
};

export default React.memo(Reflection);
