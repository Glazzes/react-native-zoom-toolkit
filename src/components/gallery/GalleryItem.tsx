import React, { useRef } from 'react';
import { View } from 'react-native';
import ResumableZoom from '../resumable/ResumableZoom';
import {
  Easing,
  clamp,
  runOnJS,
  withTiming,
  type SharedValue,
  type WithTimingConfig,
} from 'react-native-reanimated';
import type { ResumableZoomType } from '../resumable/types';
import type {
  PanGestureEvent,
  SizeVector,
  TapGestureEvent,
} from '../../commons/types';
import { snapPoint } from '../../commons/utils/snapPoint';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import type { LayoutChangeEvent } from 'react-native';

type GalleryItemProps = React.PropsWithChildren<{
  index: number;
  itemCount: number;
  edgeTapToItem: boolean;
  activeIndex: SharedValue<number>;
  container: SizeVector<SharedValue<number>>;
  scroll: SharedValue<number>;
  scrollOffset: SharedValue<number>;
}>;

const TIMING_CONFIG: WithTimingConfig = { easing: Easing.linear };

const GalleryItem: React.FC<GalleryItemProps> = ({
  children,
  index,
  itemCount,
  edgeTapToItem,
  container,
  scroll,
  scrollOffset,
}) => {
  const ref = useRef<ResumableZoomType>(null);
  const reset = () => {
    ref.current?.reset(false);
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

  const onBoundsExceeded = (exceededBy: number) => {
    'worklet';
    const to = scrollOffset.value + exceededBy;
    scroll.value = clamp(to, 0, container.width.value * (itemCount - 1));
  };

  const onTap = (e: TapGestureEvent) => {
    if (edgeTapToItem && e.x <= child.width.value * 0.15) {
      scroll.value = clampScroll(container.width.value * (index - 1));
    }

    if (edgeTapToItem && e.x >= child.width.value * 0.85) {
      scroll.value = clampScroll(container.width.value * (index + 1));
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
      }
    });
  };

  const onSwipeRight = () => {
    const scrollSize = container.width.value;
    const to = clampScroll(scrollSize * (index - 1));
    scroll.value = withTiming(to, TIMING_CONFIG, () => {
      scrollOffset.value = scroll.value;
      runOnJS(reset)();
    });
  };

  const onSwipeLeft = () => {
    const scrollSize = container.width.value;
    const to = clampScroll(scrollSize * (index + 1));
    scroll.value = withTiming(to, TIMING_CONFIG, () => {
      scrollOffset.value = scroll.value;
      runOnJS(reset)();
    });
  };

  return (
    <ResumableZoom
      ref={ref}
      onTap={onTap}
      onPanStart={onPanStart}
      onPanEnd={onPanEnd}
      onSwipeRight={onSwipeRight}
      onSwipeLeft={onSwipeLeft}
      onHorizontalBoundsExceeded={onBoundsExceeded}
    >
      <View onLayout={onLayout}>{children}</View>
    </ResumableZoom>
  );
};

export default GalleryItem;
