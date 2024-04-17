import React, { useRef } from 'react';
import { View, StyleSheet, type LayoutChangeEvent } from 'react-native';
import ResumableZoom from '../resumable/ResumableZoom';
import {
  Easing,
  clamp,
  runOnJS,
  useDerivedValue,
  withTiming,
  type SharedValue,
  type WithTimingConfig,
} from 'react-native-reanimated';
import type { ResumableZoomState, ResumableZoomType } from '../resumable/types';
import type {
  PanGestureEvent,
  SizeVector,
  TapGestureEvent,
} from '../../commons/types';
import { snapPoint } from '../../commons/utils/snapPoint';
import { useSizeVector } from '../../commons/hooks/useSizeVector';

type GalleryItemProps = React.PropsWithChildren<{
  index: number;
  itemCount: number;
  tapOnEdgeToItem: boolean;
  activeIndex: SharedValue<number>;
  resetIndex: SharedValue<number>;
  stateIndex: SharedValue<number>;
  stateCB: SharedValue<((state: ResumableZoomState) => void) | undefined>;
  container: SizeVector<SharedValue<number>>;
  scroll: SharedValue<number>;
  scrollOffset: SharedValue<number>;
}>;

const TIMING_CONFIG: WithTimingConfig = { easing: Easing.linear };

const GalleryItem: React.FC<GalleryItemProps> = ({
  children,
  index,
  itemCount,
  activeIndex,
  resetIndex,
  stateIndex,
  stateCB,
  tapOnEdgeToItem,
  container,
  scroll,
  scrollOffset,
}) => {
  const ref = useRef<ResumableZoomType>(null);
  const reset = () => {
    ref.current?.reset(false);
  };

  const requestState = () => {
    const state = ref.current?.requestState();
    if (state && stateCB.value) {
      stateCB.value(state);
      stateCB.value = undefined;
    }
  };

  const child = useSizeVector(0, 0);
  const onLayout = (e: LayoutChangeEvent) => {
    child.width.value = e.nativeEvent.layout.width;
    child.height.value = e.nativeEvent.layout.height;
  };

  const clampScroll = (sc: number): number => {
    const upperBound = container.width.value * (itemCount - 1);
    return clamp(sc, 0, upperBound);
  };

  const updateIndex = (acc: 1 | -1) => {
    activeIndex.value = index + acc;
  };

  const onBoundsExceeded = (exceededBy: number) => {
    'worklet';
    const to = scrollOffset.value + exceededBy;
    scroll.value = clamp(to, 0, container.width.value * (itemCount - 1));
  };

  const onTap = (e: TapGestureEvent) => {
    if (!tapOnEdgeToItem) return;
    if (e.x <= child.width.value * 0.15 && index > 0) {
      scroll.value = clampScroll(container.width.value * (index - 1));
      runOnJS(updateIndex)(-1);
    }

    if (e.x >= child.width.value * 0.85 && index < itemCount - 1) {
      scroll.value = clampScroll(container.width.value * (index + 1));
      runOnJS(updateIndex)(1);
    }
  };

  const onPanStart = () => (scrollOffset.value = scroll.value);
  const onPanEnd = (e: PanGestureEvent) => {
    const scrollSize = container.width.value;
    const prev = scrollSize * (index - 1);
    const current = scrollSize * index;
    const next = scrollSize * (index + 1);

    const points = scroll.value >= current ? [current, next] : [prev, current];
    const to = clampScroll(snapPoint(scroll.value, e.velocityX, points));

    scroll.value = withTiming(to, TIMING_CONFIG, () => {
      scrollOffset.value = scroll.value;
      if (to !== current) {
        runOnJS(reset)();
        runOnJS(updateIndex)(to === next ? 1 : -1);
      }
    });
  };

  const onSwipe = (direction: 'right' | 'left') => {
    const scrollSize = container.width.value;
    const acc = direction === 'right' ? -1 : 1;
    const to = clampScroll(scrollSize * (index + acc));

    scroll.value = withTiming(to, TIMING_CONFIG, () => {
      scrollOffset.value = scroll.value;
      runOnJS(reset)();

      if (direction === 'right' && index !== 0) runOnJS(updateIndex)(-1);
      if (direction === 'left' && index !== itemCount - 1) {
        runOnJS(updateIndex)(1);
      }
    });
  };

  useDerivedValue(() => {
    if (resetIndex.value === index) {
      runOnJS(reset)();
    }
  }, [resetIndex, reset]);

  useDerivedValue(() => {
    if (stateIndex.value === index) {
      runOnJS(requestState)();
    }
  }, [stateIndex, stateCB, index]);

  return (
    <View style={styles.wrapper}>
      <ResumableZoom
        ref={ref}
        onTap={onTap}
        onPanStart={onPanStart}
        onPanEnd={onPanEnd}
        onSwipeRight={() => onSwipe('right')}
        onSwipeLeft={() => onSwipe('left')}
        onHorizontalBoundsExceeded={onBoundsExceeded}
      >
        <View collapsable={false} onLayout={onLayout}>
          {children}
        </View>
      </ResumableZoom>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default GalleryItem;
