import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, StyleSheet, type LayoutChangeEvent } from 'react-native';
import {
  clamp,
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { snapPoint } from '../../commons/utils/snapPoint';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import type { PanGestureEvent, TimingConfig } from '../../commons/types';
import type { GalleryProps, GalleryType } from './types';
import Reflection from './Reflection';
import GalleryItem from './GalleryItem';
import { useVector } from '../../commons/hooks/useVector';

const config: TimingConfig = {
  duration: 300,
  easing: Easing.linear,
};

const Gallery = <T extends unknown>(
  props: GalleryProps<T>,
  ref: React.ForwardedRef<GalleryType>
) => {
  const {
    data,
    initialIndex = 0,
    numberToRender = 5,
    renderItem,
    onIndexChange,
    onScroll,
  } = props;

  const nextItems = Math.floor(numberToRender / 2);

  const rootChild = useSizeVector(0, 0);
  const translate = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const [scrollIndex, setScrollIndex] = useState<number>(initialIndex);
  const activeIndex = useSharedValue<number>(initialIndex);
  const fetchIndex = useSharedValue<number>(initialIndex);
  const resetIndex = useSharedValue<number>(initialIndex);

  const rootSize = useSizeVector(0, 0);
  const scroll = useSharedValue<number>(0);
  const offset = useSharedValue<number>(0);

  useDerivedValue(() => {
    onScroll?.(
      scroll.value,
      data.length * rootSize.width.value - rootSize.width.value
    );
  }, [scroll.value, rootSize, data.length]);

  const measureRoot = (e: LayoutChangeEvent) => {
    rootSize.width.value = e.nativeEvent.layout.width;
    rootSize.height.value = e.nativeEvent.layout.height;
    scroll.value = activeIndex.value * e.nativeEvent.layout.width;
  };

  const clampScroll = (value: number) => {
    'worklet';
    return clamp(value, 0, (data.length - 1) * rootSize.width.value);
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
        resetIndex.value = index;
      }
    });
  };

  const onSwipe = (direction: 'right' | 'left') => {
    'worklet';
    const index = activeIndex.value;

    const toIndex = index + (direction === 'right' ? -1 : 1);
    if (toIndex < 0 || toIndex > data.length - 1) return;

    fetchIndex.value = toIndex;

    const to = clampScroll(toIndex * rootSize.width.value);

    scroll.value = withTiming(to, config, () => {
      activeIndex.value = toIndex;
      resetIndex.value = index;
      offset.value = scroll.value;
    });
  };

  useDerivedValue(() => {
    if (onIndexChange) runOnJS(onIndexChange)(activeIndex.value);
  }, [activeIndex]);

  useDerivedValue(() => {
    runOnJS(setScrollIndex)(fetchIndex.value);
  }, [fetchIndex]);

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => {
      scroll.value = index * rootSize.width.value;
    },
    reset: () => (resetIndex.value = activeIndex.value),
  }));

  return (
    <GestureHandlerRootView style={styles.root} onLayout={measureRoot}>
      {data.map((item, index) => {
        if (
          index < scrollIndex - nextItems ||
          index > scrollIndex + nextItems
        ) {
          return null;
        }

        return (
          <GalleryItem
            key={`item-${index}`}
            count={data.length}
            index={index}
            activeIndex={activeIndex}
            scroll={scroll}
            rootSize={rootSize}
            rootChild={rootChild}
            translate={translate}
            scale={scale}
          >
            {renderItem(item, index)}
          </GalleryItem>
        );
      })}

      <Reflection
        activeIndex={activeIndex}
        scroll={scroll}
        scrollOffset={offset}
        rootSize={rootSize}
        rootChild={rootChild}
        translate={translate}
        scale={scale}
        length={data.length}
        onSwipe={onSwipe}
        onPanEnd={onPanEnd}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#131313',
  },
});

type GalleryPropsWithRef<T> = GalleryProps<T> & {
  ref?: React.ForwardedRef<GalleryType>;
};

export default forwardRef(Gallery) as <T>(
  props: GalleryPropsWithRef<T>
) => ReturnType<typeof Gallery>;
