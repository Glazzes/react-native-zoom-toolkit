import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import {
  clamp,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { useVector } from '../../commons/hooks/useVector';

import Reflection from './Reflection';
import GalleryItem from './GalleryItem';
import type { GalleryProps, GalleryType } from './types';
import { getMaxScale } from '../../commons/utils/getMaxScale';

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
    onIndexChange,
    onScroll,
    onTap: onUserTap,
  } = props;

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
      return getMaxScale(
        { width: rootChild.width.value, height: rootChild.height.value },
        userMaxScale[activeIndex.value]!
      );
    }

    return userMaxScale;
  }, [userMaxScale, activeIndex, rootChild]);

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
    scroll.value = index * rootSize.width.value;
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
            activeIndex={activeIndex}
            scroll={scroll}
            rootSize={rootSize}
            rootChild={rootChild}
            translate={translate}
            scale={scale}
            isScrolling={isScrolling}
          >
            {renderItem(item, index)}
          </GalleryItem>
        );
      })}

      <Reflection
        activeIndex={activeIndex}
        resetIndex={resetIndex}
        fetchIndex={fetchIndex}
        scroll={scroll}
        scrollOffset={offset}
        rootSize={rootSize}
        rootChild={rootChild}
        translate={translate}
        scale={scale}
        length={data.length}
        isScrolling={isScrolling}
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
