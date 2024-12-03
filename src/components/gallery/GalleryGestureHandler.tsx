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
  SwipeDirection,
  BoundsFuction,
  PanGestureEvent,
  ScaleMode,
  PinchCenteringMode,
} from '../../commons/types';
import { GalleryContext } from './context';
import { type GalleryProps } from './types';
import { getScrollPosition } from '../../commons/utils/getScrollPosition';

const minScale = 1;
const config = { duration: 300, easing: Easing.linear };

type GalleryGestureHandlerProps = {
  length: number;
  gap: number;
  maxScale: SharedValue<number>;
  itemSize: Readonly<SharedValue<number>>;
  vertical: boolean;
  tapOnEdgeToItem: boolean;
  allowPinchPanning: boolean;
  allowOverflow: boolean;
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
const GalleryGestureHandler = ({
  length,
  gap,
  maxScale,
  itemSize,
  vertical,
  tapOnEdgeToItem,
  zoomEnabled,
  scaleMode,
  allowOverflow,
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
}: GalleryGestureHandlerProps) => {
  const {
    activeIndex,
    scroll,
    scrollOffset,
    isScrolling,
    rootSize,
    rootChildSize,
    translate,
    scale,
    overflow,
    hideAdjacentItems,
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

    cancelAnimation(scroll);

    const prev = getScrollPosition({
      index: clamp(activeIndex.value - 1, 0, length - 1),
      itemSize: itemSize.value,
      gap,
    });
    const current = getScrollPosition({
      index: activeIndex.value,
      itemSize: itemSize.value,
      gap,
    });
    const next = getScrollPosition({
      index: clamp(activeIndex.value + 1, 0, length - 1),
      itemSize: itemSize.value,
      gap,
    });

    const velocity = vertical ? e.velocityY : e.velocityX;
    const toScroll = snapPoint(scroll.value, velocity, [prev, current, next]);

    scroll.value = withTiming(toScroll, config, (finished) => {
      if (!finished) return;
      if (toScroll !== current) {
        activeIndex.value += toScroll === next ? 1 : -1;
      }

      isScrolling.value = false;
      toScroll !== current && reset(0, 0, minScale, false);
    });
  };

  const onSwipe = (direction: SwipeDirection) => {
    'worklet';

    cancelAnimation(scroll);

    let toIndex = activeIndex.value;
    if (direction === 'up' && vertical) toIndex += 1;
    if (direction === 'down' && vertical) toIndex -= 1;
    if (direction === 'left' && !vertical) toIndex += 1;
    if (direction === 'right' && !vertical) toIndex -= 1;

    toIndex = clamp(toIndex, 0, length - 1);
    if (toIndex === activeIndex.value) {
      return;
    }

    const newScrollPosition = getScrollPosition({
      index: toIndex,
      itemSize: itemSize.value,
      gap,
    });

    scroll.value = withTiming(newScrollPosition, config, (finished) => {
      if (!finished) return;

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

  const onGestureEndWrapper = () => {
    overflow.value = 'hidden';
    hideAdjacentItems.value = false;
    onGestureEnd?.();
  };

  const {
    gesturesEnabled,
    onTouchesDown,
    onTouchesMove,
    onTouchesUp,
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
      onGestureEnd: onGestureEndWrapper,
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
    .withTestId('pinch')
    .enabled(zoomEnabled)
    .manualActivation(true)
    .onTouchesDown(onTouchesDown)
    .onTouchesMove(onTouchesMove)
    .onTouchesUp(onTouchesUp)
    .onStart((e) => {
      if (allowOverflow) {
        overflow.value = 'visible';
        hideAdjacentItems.value = true;
      }

      onPinchStart(e);
    })
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .withTestId('pan')
    .maxPointers(1)
    .minVelocity(100)
    .enabled(gesturesEnabled)
    .onStart((e) => {
      onPanStart && runOnJS(onPanStart)(e);
      cancelAnimation(translate.x);
      cancelAnimation(translate.y);
      cancelAnimation(scroll);

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

      const items = length - 1;
      scroll.value = clamp(to, 0, items * itemSize.value + items * gap);

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
    .withTestId('tap')
    .enabled(gesturesEnabled)
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd((event) => {
      const gallerySize = {
        width: rootSize.width.value,
        height: rootSize.height.value,
      };

      const rect = getVisibleRect({
        scale: scale.value,
        containerSize: gallerySize,
        itemSize: gallerySize,
        translation: { x: translate.x.value, y: translate.y.value },
      });

      const tapEdge = 44 / scale.value;
      const leftEdge = rect.x + tapEdge;
      const rightEdge = rect.x + rect.width - tapEdge;

      let toIndex = activeIndex.value;
      const canGoToItem = tapOnEdgeToItem && !vertical;
      if (event.x <= leftEdge && canGoToItem) toIndex -= 1;
      if (event.x >= rightEdge && canGoToItem) toIndex += 1;

      toIndex = clamp(toIndex, 0, length - 1);
      if (toIndex === activeIndex.value) {
        onTap && runOnJS(onTap)(event, activeIndex.value);
        return;
      }

      const toScroll = getScrollPosition({
        index: toIndex,
        itemSize: itemSize.value,
        gap,
      });

      scroll.value = toScroll;
      activeIndex.value = toIndex;

      reset(0, 0, minScale, false);
    });

  const doubleTap = Gesture.Tap()
    .withTestId('doubleTap')
    .enabled(gesturesEnabled && zoomEnabled)
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(onDoubleTapEnd);

  const detectorStyle = useAnimatedStyle(() => {
    const width = Math.max(rootSize.width.value, rootChildSize.width.value);
    const height = Math.max(rootSize.height.value, rootChildSize.height.value);

    return {
      width: width,
      height: height,
      position: 'absolute',
      zIndex: 2_147_483_647,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { scale: scale.value },
      ],
    };
  }, [rootSize, rootChildSize, translate, scale]);

  const composed = Gesture.Race(pan, pinch, Gesture.Exclusive(doubleTap, tap));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={detectorStyle} />
    </GestureDetector>
  );
};

export default React.memo(GalleryGestureHandler, (prev, next) => {
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
    prev.allowOverflow === next.allowOverflow &&
    prev.pinchCenteringMode === next.pinchCenteringMode &&
    prev.onVerticalPull === next.onVerticalPull
  );
});
