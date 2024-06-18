import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import getPanWithPinchStatus from '../../commons/utils/getPanWithPinchStatus';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { useVector } from '../../commons/hooks/useVector';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { clamp } from '../../commons/utils/clamp';

import Reflection from './Reflection';
import GalleryItem from './GalleryItem';
import type { GalleryProps, GalleryType } from './types';

const Gallery = <T extends unknown>(
  props: GalleryProps<T>,
  ref: React.ForwardedRef<GalleryType>
) => {
  const {
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
  const activeIndex = useSharedValue<number>(initialIndex);
  const fetchIndex = useSharedValue<number>(initialIndex);
  const resetIndex = useSharedValue<number>(initialIndex);

  const rootChild = useSizeVector(0, 0);
  const rootSize = useSizeVector(0, 0);

  const translate = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const scroll = useSharedValue<number>(0);
  const offset = useSharedValue<number>(0);

  const isScrolling = useSharedValue<boolean>(false);

  const maxScale = useDerivedValue(() => {
    if (typeof userMaxScale === 'object') {
      if (userMaxScale.length === 0) return 6;

      return getMaxScale(
        { width: rootChild.width.value, height: rootChild.height.value },
        userMaxScale[activeIndex.value]!
      );
    }

    return userMaxScale as number;
  }, [userMaxScale, activeIndex, rootChild]);

  const measureRoot = (e: LayoutChangeEvent) => {
    rootSize.width.value = e.nativeEvent.layout.width;
    rootSize.height.value = e.nativeEvent.layout.height;
    scroll.value = activeIndex.value * e.nativeEvent.layout.width;
  };

  useDerivedValue(() => {
    onScroll?.(
      scroll.value,
      data.length * rootSize.width.value - rootSize.width.value
    );
  }, [scroll.value, rootSize, data.length]);

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
    scroll.value = clamped * rootSize.width.value;
  };

  const requestState = () => ({
    width: rootChild.width.value,
    height: rootChild.height.value,
    translateX: translate.x.value,
    translateY: translate.y.value,
    scale: scale.value,
  });

  useImperativeHandle(ref, () => ({
    setIndex,
    reset: () => (resetIndex.value += 1),
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
            activeIndex={activeIndex}
            scroll={scroll}
            rootSize={rootSize}
            rootChild={rootChild}
            translate={translate}
            scale={scale}
            isScrolling={isScrolling}
          />
        );
      })}

      <Reflection
        activeIndex={activeIndex}
        resetIndex={resetIndex}
        fetchIndex={fetchIndex}
        maxScale={maxScale}
        scroll={scroll}
        scrollOffset={offset}
        rootSize={rootSize}
        rootChild={rootChild}
        translate={translate}
        scale={scale}
        length={data.length}
        isScrolling={isScrolling}
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

type GalleryPropsWithRef<T> = GalleryProps<T> & {
  ref?: React.ForwardedRef<GalleryType>;
};

export default forwardRef(Gallery) as <T>(
  props: GalleryPropsWithRef<T>
) => ReturnType<typeof Gallery>;
