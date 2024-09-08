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
  type WithDecayConfig,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { clamp } from '../../commons/utils/clamp';
import { useVector } from '../../commons/hooks/useVector';
import { snapPoint } from '../../commons/utils/snapPoint';
import { getVisibleRect } from '../../commons/utils/getVisibleRect';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';
import { useDoubleTapCommons } from '../../commons/hooks/useDoubleTapCommons';
import { getSwipeDirection } from '../../commons/utils/getSwipeDirection';

import type {
  PinchCenteringMode,
  ScaleMode,
  SwipeDirection,
  BoundsFuction,
  PanGestureEvent,
} from '../../commons/types';
import { GalleryContext } from './context';
import { type GalleryProps } from './types';

const minScale = 1;
const config = { duration: 300, easing: Easing.linear };

type ReflectionProps = {
  length: number;
  maxScale: SharedValue<number>;
  itemSize: Readonly<SharedValue<number>>;
  vertical: boolean;
  tapOnEdgeToItem: boolean;
  allowPinchPanning: boolean;
  zoomEnabled: boolean;
  scaleMode: ScaleMode;
  pinchCenteringMode: PinchCenteringMode;
  onTap?: GalleryProps['onTap'];
  onPanStart?: GalleryProps['onPanStart'];
  onPanEnd?: GalleryProps['onPanEnd'];
  onPinchStart?: GalleryProps['onPinchStart'];
  onPinchEnd?: GalleryProps['onPinchEnd'];
  onSwipe?: GalleryProps['onSwipe'];
  onVerticalPull?: GalleryProps['onVerticalPull'];
  onGestureEnd?: GalleryProps['onGestureEnd'];
};

/*
 * Pinchable views are really heavy components, therefore in order to maximize performance
 * only a single pinchable view is shared among all the list items, items listen to this
 * component updates and only update themselves if they are the current item.
 */
const Reflection = ({
  length,
  maxScale,
  itemSize,
  vertical,
  tapOnEdgeToItem,
  zoomEnabled,
  scaleMode,
  allowPinchPanning,
  pinchCenteringMode,
  onTap,
  onPanStart,
  onPanEnd,
  onPinchStart: onUserPinchStart,
  onPinchEnd: onUserPinchEnd,
  onSwipe: onUserSwipe,
  onVerticalPull,
  onGestureEnd,
}: ReflectionProps) => {
  const {
    activeIndex,
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
  const scaleOffset = useSharedValue<number>(1);

  const time = useSharedValue<number>(0);
  const position = useVector(0, 0);
  const gestureEnd = useSharedValue<number>(0);
  const isPullingVertical = useSharedValue<boolean>(false);
  const pullReleased = useSharedValue<boolean>(false);

  const boundsFn: BoundsFuction = (optionalScale) => {
    'worklet';

    const scaleValue = optionalScale ?? scale.value;
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
    cancelAnimation(translate.x);
    cancelAnimation(translate.y);
    cancelAnimation(scale);

    translate.x.value = animate ? withTiming(toX) : toX;
    translate.y.value = animate ? withTiming(toY) : toY;
    scale.value = animate ? withTiming(toScale) : toScale;
    scaleOffset.value = toScale;
  };

  const snapToScrollPosition = (e: PanGestureEvent) => {
    'worklet';
    const index = activeIndex.value;
    const prev = itemSize.value * clamp(index - 1, 0, length - 1);
    const current = itemSize.value * index;
    const next = itemSize.value * clamp(index + 1, 0, length - 1);

    const velocity = vertical ? e.velocityY : e.velocityX;
    const toScroll = snapPoint(scroll.value, velocity, [prev, current, next]);

    if (toScroll !== current)
      fetchIndex.value = index + (toScroll === next ? 1 : -1);

    scroll.value = withTiming(toScroll, config, () => {
      activeIndex.value = fetchIndex.value;
      isScrolling.value = false;
      toScroll !== current && reset(0, 0, minScale, false);
    });
  };

  const onSwipe = (direction: SwipeDirection) => {
    'worklet';

    let toIndex = activeIndex.value;
    if (direction === 'up' && vertical) toIndex += 1;
    if (direction === 'down' && vertical) toIndex -= 1;
    if (direction === 'left' && !vertical) toIndex += 1;
    if (direction === 'right' && !vertical) toIndex -= 1;

    toIndex = clamp(toIndex, 0, length - 1);
    if (toIndex === activeIndex.value) return;

    fetchIndex.value = toIndex;
    scroll.value = withTiming(toIndex * itemSize.value, config, () => {
      activeIndex.value = toIndex;
      isScrolling.value = false;
      reset(0, 0, minScale, false);
    });
  };

  useAnimatedReaction(
    () => ({
      translate: translate.y.value,
      isPulling: isPullingVertical.value,
      released: pullReleased.value,
    }),
    (val) => {
      val.isPulling && onVerticalPull?.(val.translate, val.released);
    },
    [translate, isPullingVertical, pullReleased]
  );

  useAnimatedReaction(
    () => ({
      width: rootSize.width.value,
      height: rootSize.height.value,
    }),
    () => reset(0, 0, minScale, false),
    [rootSize]
  );

  const {
    gesturesEnabled,
    onTouchesMove,
    onPinchStart,
    onPinchUpdate,
    onPinchEnd,
  } = usePinchCommons({
    container: rootSize,
    translate,
    offset,
    scale,
    scaleOffset,
    minScale,
    maxScale,
    scaleMode,
    allowPinchPanning,
    pinchCenteringMode,
    boundFn: boundsFn,
    userCallbacks: {
      onPinchStart: onUserPinchStart,
      onPinchEnd: onUserPinchEnd,
      onGestureEnd,
    },
  });

  const { onDoubleTapEnd } = useDoubleTapCommons({
    container: rootSize,
    translate,
    scale,
    minScale,
    maxScale,
    scaleOffset,
    boundsFn,
    onGestureEnd,
  });

  const pinch = Gesture.Pinch()
    .enabled(zoomEnabled)
    .onTouchesMove(onTouchesMove)
    .onStart(onPinchStart)
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .maxPointers(1)
    .enabled(gesturesEnabled)
    .onStart((e) => {
      onPanStart && runOnJS(onPanStart)(e);
      cancelAnimation(translate.x);
      cancelAnimation(translate.y);

      const isVerticalPan = Math.abs(e.velocityY) > Math.abs(e.velocityX);
      isPullingVertical.value = isVerticalPan && scale.value === 1 && !vertical;
      isScrolling.value = true;

      time.value = performance.now();
      position.x.value = e.absoluteX;
      position.y.value = e.absoluteY;

      scrollOffset.value = scroll.value;
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onUpdate((e) => {
      if (isPullingVertical.value) {
        translate.y.value = e.translationY;
        return;
      }

      const toX = offset.x.value + e.translationX;
      const toY = offset.y.value + e.translationY;

      const { x: boundX, y: boundY } = boundsFn(scale.value);
      const exceedX = Math.max(0, Math.abs(toX) - boundX);
      const exceedY = Math.max(0, Math.abs(toY) - boundY);

      const scrollX = -1 * Math.sign(toX) * exceedX;
      const scrollY = -1 * Math.sign(toY) * exceedY;
      const to = scrollOffset.value + (vertical ? scrollY : scrollX);
      scroll.value = clamp(to, 0, (length - 1) * itemSize.value);

      translate.x.value = clamp(toX, -1 * boundX, boundX);
      translate.y.value = clamp(toY, -1 * boundY, boundY);
    })
    .onEnd((e) => {
      const bounds = boundsFn(scale.value);
      const direction = getSwipeDirection(e, {
        boundaries: bounds,
        time: time.value,
        position: { x: position.x.value, y: position.y.value },
        translate: {
          x: isPullingVertical.value ? 100 : translate.x.value,
          y: isPullingVertical.value ? 0 : translate.y.value,
        },
      });

      direction !== undefined && onSwipe(direction);
      direction !== undefined && onUserSwipe && runOnJS(onUserSwipe)(direction);

      if (isPullingVertical.value) {
        pullReleased.value = true;
        translate.y.value = withTiming(0, undefined, (finished) => {
          isPullingVertical.value = !finished;
          pullReleased.value = !finished;
        });

        return;
      }

      const isSwipingH = direction === 'left' || direction === 'right';
      const isSwipingV = direction === 'up' || direction === 'down';
      const snapV = vertical && (direction === undefined || isSwipingH);
      const snapH = !vertical && (direction === undefined || isSwipingV);

      (snapV || snapH) && snapToScrollPosition(e);
      direction === undefined && onPanEnd && runOnJS(onPanEnd)(e);

      const configX = { velocity: e.velocityX, clamp: [-bounds.x, bounds.x] };
      const configY = { velocity: e.velocityY, clamp: [-bounds.y, bounds.y] };

      const restX = Math.abs(Math.abs(translate.x.value) - bounds.x);
      const restY = Math.abs(Math.abs(translate.y.value) - bounds.y);
      const finalConfig = restX > restY ? configX : configY;
      gestureEnd.value = restX > restY ? translate.x.value : translate.y.value;
      gestureEnd.value = withDecay(finalConfig as WithDecayConfig, () => {
        onGestureEnd && runOnJS(onGestureEnd)();
      });

      translate.x.value = withDecay(configX as WithDecayConfig);
      translate.y.value = withDecay(configY as WithDecayConfig);
    });

  const tap = Gesture.Tap()
    .enabled(gesturesEnabled)
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd((e) => {
      const event = { ...e, x: e.x / scale.value, y: e.y / scale.value };

      const gallerySize = {
        width: rootSize.width.value,
        height: rootSize.height.value,
      };

      const { x, width } = getVisibleRect({
        scale: scale.value,
        visibleSize: gallerySize,
        canvasSize: gallerySize,
        elementSize: gallerySize,
        offset: { x: translate.x.value, y: translate.y.value },
      });

      const tapEdge = 44 / scale.value;
      const leftEdge = x + tapEdge;
      const rightEdge = x + width - tapEdge;

      let toIndex = activeIndex.value;
      const canGoToItem = tapOnEdgeToItem && !vertical;
      if (event.x <= leftEdge && canGoToItem) toIndex -= 1;
      if (event.x >= rightEdge && canGoToItem) toIndex += 1;

      if (toIndex === activeIndex.value) {
        onTap && runOnJS(onTap)(event, activeIndex.value);
        return;
      }

      toIndex = clamp(toIndex, 0, length - 1);
      scroll.value = toIndex * itemSize.value;
      activeIndex.value = toIndex;
      fetchIndex.value = toIndex;

      reset(0, 0, minScale, false);
    });

  const doubleTap = Gesture.Tap()
    .enabled(gesturesEnabled && zoomEnabled)
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(onDoubleTapEnd);

  const detectorStyle = useAnimatedStyle(() => {
    const width = Math.max(rootSize.width.value, rootChildSize.width.value);
    const height = Math.max(rootSize.height.value, rootChildSize.height.value);

    return {
      width: width * scaleOffset.value,
      height: height * scaleOffset.value,
      position: 'absolute',
      zIndex: Number.MAX_SAFE_INTEGER,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
      ],
    };
  }, [rootSize, rootChildSize, translate, scaleOffset]);

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
    prev.zoomEnabled === next.zoomEnabled &&
    prev.scaleMode === next.scaleMode &&
    prev.allowPinchPanning === next.allowPinchPanning &&
    prev.pinchCenteringMode === next.pinchCenteringMode &&
    prev.onVerticalPull === next.onVerticalPull
  );
});
