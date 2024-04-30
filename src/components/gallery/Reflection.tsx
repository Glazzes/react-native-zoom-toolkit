import React, { useState } from 'react';
import Animated, {
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
  Vector,
} from '../../commons/types';

const minScale = 1;
const maxScale = 6;
// const config = { duration: 200, easing: Easing.linear };

type ReflectionProps = {
  activeIndex: SharedValue<number>;
  length: number;
  rootSize: SizeVector<SharedValue<number>>;
  rootChild: SizeVector<SharedValue<number>>;
  scroll: SharedValue<number>;
  scrollOffset: SharedValue<number>;
  translate: Vector<SharedValue<number>>;
  scale: SharedValue<number>;
  onSwipe: (direction: 'right' | 'left') => void;
  onPanEnd: (e: PanGestureEvent) => void;
};

const Reflection = ({
  activeIndex,
  length,
  rootSize,
  rootChild,
  scroll,
  scrollOffset,
  translate,
  scale,
  onSwipe,
  onPanEnd,
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

  useAnimatedReaction(
    () => activeIndex.value,
    () => reset(0, 0, minScale, false),
    [activeIndex]
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
          x: delta.x.value * scaleOffset.value,
          y: delta.y.value * scaleOffset.value,
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

      if (scale.value > maxScale) {
        const scaleDiff = Math.max(
          0,
          scaleOffset.value - (scale.value - scaleOffset.value) / 2
        );

        const { x, y } = pinchTransform({
          toScale: maxScale,
          fromScale: scale.value,
          origin: { x: origin.x.value, y: origin.y.value },
          offset: { x: translate.x.value, y: translate.y.value },
          delta: { x: 0, y: -1 * delta.y.value * scaleDiff },
        });

        const { x: boundX, y: boundY } = boundsFn(maxScale);
        const toX = clamp(x, -1 * boundX, boundX);
        const toY = clamp(y, -1 * boundY, boundY);
        reset(toX, toY, maxScale);

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

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(enabled)
    .maxDuration(250)
    .onEnd((e) => {
      if (scale.value >= maxScale * 0.8) {
        reset(0, 0, minScale);
        return;
      }

      const originX = e.x - rootSize.width.value / 2;
      const originY = e.y - rootSize.height.value / 2;

      const { x, y } = pinchTransform({
        toScale: maxScale,
        fromScale: scale.value,
        origin: { x: originX, y: originY },
        delta: { x: 0, y: 0 },
        offset: { x: translate.x.value, y: translate.y.value },
      });

      const { x: boundX, y: boundY } = boundsFn(maxScale);
      const toX = clamp(x, -1 * boundX, boundX);
      const toY = clamp(y, -1 * boundY, boundY);
      reset(toX, toY, maxScale);
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
    <GestureDetector gesture={Gesture.Race(pan, pinch, doubleTap)}>
      <Animated.View style={detectorStyle} />
    </GestureDetector>
  );
};

export default React.memo(Reflection);
