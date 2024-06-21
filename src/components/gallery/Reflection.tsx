import React, { useContext } from 'react';
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
import {
  PanMode,
  ScaleMode,
  SwipeDirection,
  type BoundsFuction,
  type PanGestureEvent,
  type PanGestureEventCallback,
  type PinchGestureEventCallback,
  type TapGestureEvent,
} from '../../commons/types';
import { snapPoint } from '../../commons/utils/snapPoint';
import getSwipeDirection from '../../commons/utils/getSwipeDirection';
import { GalleryContext } from './context';
import { crop } from '../../commons/utils/crop';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';

const minScale = 1;
const config = { duration: 300, easing: Easing.linear };

type ReflectionProps = {
  length: number;
  maxScale: SharedValue<number>;
  scrollDirection: Readonly<SharedValue<number>>;
  vertical: boolean;
  tapOnEdgeToItem: boolean;
  allowPinchPanning: boolean;
  onTap?: (e: TapGestureEvent, index: number) => void;
  onPanStart?: PanGestureEventCallback;
  onPanEnd?: PanGestureEventCallback;
  onPinchStart?: PinchGestureEventCallback;
  onPinchEnd?: PinchGestureEventCallback;
  onSwipe?: (direction: SwipeDirection) => void;
};

/*
 * Pinchable views are heavy components, real heavy ones, therefore in order to maximize
 * performance only a single Pinchable view is shared among all the list items, by listening
 * to this component updates the elements in the list get updated only if they're the current
 * index.
 */
const Reflection = ({
  length,
  maxScale,
  scrollDirection,
  vertical,
  tapOnEdgeToItem,
  allowPinchPanning,
  onTap,
  onPanStart,
  onPanEnd,
  onPinchStart: onUserPinchStart,
  onPinchEnd: onUserPinchEnd,
  onSwipe: onUserSwipe,
}: ReflectionProps) => {
  const {
    activeIndex,
    resetIndex,
    fetchIndex,
    scroll,
    scrollOffset,
    isScrolling,
    rootSize,
    rootChildSize,
    translate,
    scale,
  } = useContext(GalleryContext);

  const offset = useVector(0, 0);
  const origin = useVector(0, 0);
  const delta = useVector(0, 0);
  const scaleOffset = useSharedValue<number>(1);

  const detectorTranslate = useVector(0, 0);
  const detectorScale = useSharedValue<number>(1);

  const time = useSharedValue<number>(0);
  const position = useVector(0, 0);

  const boundsFn: BoundsFuction = (scaleValue) => {
    'worklet';

    const { width: cWidth, height: cHeight } = rootChildSize;
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
    detectorScale.value = animate ? withTiming(toScale) : toScale;
  };

  const clampScroll = (value: number) => {
    'worklet';
    return clamp(value, 0, (length - 1) * scrollDirection.value);
  };

  const onScrollEnd = (e: PanGestureEvent) => {
    'worklet';
    const index = activeIndex.value;

    const prev = scrollDirection.value * (index - 1);
    const current = scrollDirection.value * index;
    const next = scrollDirection.value * (index + 1);

    const velocity = vertical ? e.velocityY : e.velocityX;
    const points = scroll.value >= current ? [current, next] : [prev, current];
    const to = clampScroll(snapPoint(scroll.value, velocity, points));

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

  const onSwipe = (direction: SwipeDirection) => {
    'worklet';

    const index = activeIndex.value;
    let acc = 0;
    if (direction === SwipeDirection.UP && vertical) acc = 1;
    if (direction === SwipeDirection.DOWN && vertical) acc = -1;
    if (direction === SwipeDirection.LEFT && !vertical) acc = 1;
    if (direction === SwipeDirection.RIGHT && !vertical) acc = -1;

    const toIndex = index + acc;
    if (toIndex < 0 || toIndex > length - 1) return;

    fetchIndex.value = toIndex;

    const to = clampScroll(toIndex * scrollDirection.value);
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

  const { gesturesEnabled, onPinchStart, onPinchUpdate, onPinchEnd } =
    usePinchCommons({
      container: rootSize,
      detectorTranslate,
      detectorScale,
      translate,
      offset,
      origin,
      scale,
      scaleOffset,
      minScale,
      maxScale,
      delta,
      allowPinchPanning,
      scaleMode: ScaleMode.BOUNCE,
      panMode: PanMode.CLAMP,
      boundFn: boundsFn,
      userCallbacks: {
        onPinchStart: onUserPinchStart,
        onPinchEnd: onUserPinchEnd,
      },
    });

  const pinch = Gesture.Pinch()
    .onStart(onPinchStart)
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .maxPointers(1)
    .enabled(gesturesEnabled)
    .onStart((e) => {
      if (onPanStart !== undefined) {
        runOnJS(onPanStart)(e);
      }

      isScrolling.value = true;
      scrollOffset.value = scroll.value;

      time.value = performance.now();
      position.x.value = e.absoluteX;
      position.y.value = e.absoluteY;

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
      const exceedX = Math.max(0, Math.abs(toX) - boundX);
      const exceedY = Math.max(0, Math.abs(toY) - boundY);

      if (exceedX > 0 && !vertical) {
        const ex = -1 * Math.sign(toX) * exceedX;
        scroll.value = clamp(
          scrollOffset.value + ex,
          0,
          (length - 1) * rootSize.width.value
        );
      }

      if (exceedY > 0 && vertical) {
        const ey = -1 * Math.sign(toY) * exceedY;
        scroll.value = clamp(
          scrollOffset.value + ey,
          0,
          (length - 1) * rootSize.height.value
        );
      }

      translate.x.value = clamp(toX, -1 * boundX, boundX);
      translate.y.value = clamp(toY, -1 * boundY, boundY);
      detectorTranslate.x.value = clamp(toX, -1 * boundX, boundX);
      detectorTranslate.y.value = clamp(toY, -1 * boundY, boundY);
    })
    .onEnd((e) => {
      const boundaries = boundsFn(scale.value);
      const direction = getSwipeDirection(e, {
        boundaries,
        time: time.value,
        position: { x: position.x.value, y: position.y.value },
        translate: { x: translate.x.value, y: translate.y.value },
      });

      if (direction !== undefined) {
        onSwipe(direction);
        if (onUserSwipe !== undefined) runOnJS(onUserSwipe)(direction);

        return;
      }

      if (onPanEnd !== undefined) {
        runOnJS(onPanEnd)(e);
      }

      onScrollEnd(e);

      const clampX: [number, number] = [-1 * boundaries.x, boundaries.x];
      const clampY: [number, number] = [-1 * boundaries.y, boundaries.y];

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
    .enabled(gesturesEnabled)
    .numberOfTaps(1)
    .maxDuration(250)
    .runOnJS(true)
    .onEnd((e) => {
      const gallerySize = {
        width: rootSize.width.value,
        height: rootSize.height.value,
      };

      const {
        crop: { originX, width },
      } = crop({
        scale: scale.value,
        context: {
          flipHorizontal: false,
          flipVertical: false,
          rotationAngle: 0,
        },
        canvas: gallerySize,
        cropSize: gallerySize,
        resolution: gallerySize,
        position: { x: translate.x.value, y: translate.y.value },
      });

      const tapEdge = 44 / scale.value;
      const left = originX + tapEdge;
      const rightEdge = originX + width - tapEdge;

      let toIndex = activeIndex.value;
      if (e.x <= left && tapOnEdgeToItem) toIndex = activeIndex.value - 1;
      if (e.x >= rightEdge && tapOnEdgeToItem) toIndex = activeIndex.value + 1;

      if (toIndex === activeIndex.value) {
        onTap?.(e, activeIndex.value);
        return;
      }

      toIndex = clamp(toIndex, 0, length - 1);
      scroll.value = toIndex * scrollDirection.value;
      activeIndex.value = toIndex;
      fetchIndex.value = toIndex;
    });

  const doubleTap = Gesture.Tap()
    .enabled(gesturesEnabled)
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((e) => {
      const originX = e.x - rootSize.width.value / 2;
      const originY = e.y - rootSize.height.value / 2;
      const toScale =
        scale.value >= maxScale.value * 0.8 ? minScale : maxScale.value;

      const { x, y } = pinchTransform({
        toScale: toScale,
        fromScale: scale.value,
        origin: { x: originX, y: originY },
        delta: { x: 0, y: 0 },
        offset: { x: translate.x.value, y: translate.y.value },
      });

      const { x: boundX, y: boundY } = boundsFn(toScale);
      const toX = clamp(x, -1 * boundX, boundX);
      const toY = clamp(y, -1 * boundY, boundY);
      reset(toX, toY, toScale);
    });

  const detectorStyle = useAnimatedStyle(() => ({
    width: Math.max(rootSize.width.value, rootChildSize.width.value),
    height: Math.max(rootSize.height.value, rootChildSize.height.value),
    position: 'absolute',
    zIndex: Number.MAX_SAFE_INTEGER,
    transform: [
      { translateX: detectorTranslate.x.value },
      { translateY: detectorTranslate.y.value },
      { scale: detectorScale.value },
    ],
  }));

  const composed = Gesture.Race(pan, pinch, Gesture.Exclusive(doubleTap, tap));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={detectorStyle} />
    </GestureDetector>
  );
};

export default React.memo(Reflection, (prev, next) => {
  return (
    prev.onTap === next.onTap &&
    prev.onPanStart === next.onPanStart &&
    prev.onPanEnd === next.onPanEnd &&
    prev.onPinchStart === next.onPinchStart &&
    prev.onPinchEnd === next.onPinchEnd &&
    prev.onSwipe === next.onSwipe &&
    prev.length === next.length &&
    prev.vertical === next.vertical &&
    prev.tapOnEdgeToItem === next.tapOnEdgeToItem &&
    prev.allowPinchPanning === next.allowPinchPanning
  );
});
