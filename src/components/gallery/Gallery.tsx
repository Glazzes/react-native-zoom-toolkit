import React, { useContext, useImperativeHandle, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import getPanWithPinchStatus from '../../commons/utils/getPanWithPinchStatus';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { clamp } from '../../commons/utils/clamp';

import Reflection from './Reflection';
import GalleryItem from './GalleryItem';
import { GalleryContext } from './context';
import type { GalleryProps, GalleryType } from './types';

type GalleryPropsWithRef<T> = GalleryProps<T> & {
  reference?: React.ForwardedRef<GalleryType>;
};

const Gallery = <T extends unknown>(props: GalleryPropsWithRef<T>) => {
  const {
    reference,
    data,
    renderItem,
    keyExtractor,
    initialIndex = 0,
    windowSize = 5,
    maxScale: userMaxScale = 6,
    tapOnEdgeToItem = true,
    allowPinchPanning: pinchPanning,
    onIndexChange,
    onScroll,
    onTap,
    onPanStart,
    onPanEnd,
    onPinchStart,
    onPinchEnd,
    onSwipe,
  } = props;

  const allowPinchPanning = pinchPanning ?? getPanWithPinchStatus();
  const nextItems = Math.floor(windowSize / 2);

  const [scrollIndex, setScrollIndex] = useState<number>(initialIndex);
  const { activeIndex, rootSize, rootChildSize, scroll, translate, scale } =
    useContext(GalleryContext);

  const fetchIndex = useSharedValue<number>(initialIndex);
  const resetIndex = useSharedValue<number>(initialIndex);
  const offset = useSharedValue<number>(0);

  const maxScale = useDerivedValue(() => {
    if (typeof userMaxScale === 'object') {
      if (userMaxScale.length === 0) return 6;

      return getMaxScale(
        {
          width: rootChildSize.width.value,
          height: rootChildSize.height.value,
        },
        userMaxScale[activeIndex.value]!
      );
    }

    return userMaxScale as number;
  }, [userMaxScale, activeIndex, rootChildSize]);

  const measureRoot = (e: LayoutChangeEvent) => {
    rootSize.width.value = e.nativeEvent.layout.width;
    rootSize.height.value = e.nativeEvent.layout.height;
    scroll.x.value = activeIndex.value * e.nativeEvent.layout.width;
  };

  useDerivedValue(() => {
    onScroll?.(
      scroll.x.value,
      data.length * rootSize.width.value - rootSize.width.value
    );
  }, [scroll.x.value, rootSize, data.length]);

  useAnimatedReaction(
    () => activeIndex.value,
    (value) => {
      if (onIndexChange) runOnJS(onIndexChange)(value);
    },
    [activeIndex]
  );

  useAnimatedReaction(
    () => fetchIndex.value,
    (value) => runOnJS(setScrollIndex)(value),
    [fetchIndex]
  );

  const setIndex = (index: number) => {
    const clamped = clamp(index, 0, data.length);
    activeIndex.value = clamped;
    fetchIndex.value = clamped;
    scroll.x.value = clamped * rootSize.width.value;
  };

  const requestState = () => ({
    width: rootChildSize.width.value,
    height: rootChildSize.height.value,
    translateX: translate.x.value,
    translateY: translate.y.value,
    scale: scale.value,
  });

  const reset = (animate: boolean) => {
    translate.x.value = animate ? withTiming(0) : 0;
    translate.y.value = animate ? withTiming(0) : 0;
    scale.value = animate ? withTiming(1) : 1;
  };

  useImperativeHandle(reference, () => ({
    setIndex,
    reset,
    requestState,
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

        const key = keyExtractor?.(item, index) ?? `item-${index}`;

        return (
          <GalleryItem
            key={key}
            count={data.length}
            index={index}
            item={item}
            renderItem={renderItem}
          />
        );
      })}

      <Reflection
        resetIndex={resetIndex}
        fetchIndex={fetchIndex}
        maxScale={maxScale}
        scrollOffset={offset}
        length={data.length}
        allowPinchPanning={allowPinchPanning}
        tapOnEdgeToItem={tapOnEdgeToItem}
        onTap={onTap}
        onPanStart={onPanStart}
        onPanEnd={onPanEnd}
        onPinchStart={onPinchStart}
        onPinchEnd={onPinchEnd}
        onSwipe={onSwipe}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default Gallery;
