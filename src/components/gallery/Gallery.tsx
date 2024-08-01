import React, { useContext, useImperativeHandle, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { clamp } from '../../commons/utils/clamp';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { getPanWithPinchStatus } from '../../commons/utils/getPanWithPinchStatus';

import Reflection from './Reflection';
import GalleryItem from './GalleryItem';
import { GalleryContext } from './context';
import {
  PinchCenteringMode,
  type GalleryProps,
  type GalleryType,
} from './types';

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
    vertical = false,
    tapOnEdgeToItem = true,
    pinchCenteringMode = PinchCenteringMode.CLAMP,
    allowPinchPanning: pinchPanning,
    customTransition,
    onIndexChange,
    onScroll,
    onTap,
    onPanStart,
    onPanEnd,
    onPinchStart,
    onPinchEnd,
    onSwipe,
    onVerticalPull,
  } = props;

  const allowPinchPanning = pinchPanning ?? getPanWithPinchStatus();
  const nextItems = Math.floor(windowSize / 2);

  const [scrollIndex, setScrollIndex] = useState<number>(initialIndex);
  const {
    activeIndex,
    fetchIndex,
    rootSize,
    rootChildSize,
    scroll,
    translate,
    scale,
  } = useContext(GalleryContext);

  const scrollDirection = useDerivedValue(() => {
    return vertical ? rootSize.height.value : rootSize.width.value;
  }, [vertical, rootSize]);

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

    return userMaxScale;
  }, [userMaxScale, activeIndex, rootChildSize]);

  const measureRoot = (e: LayoutChangeEvent) => {
    rootSize.width.value = e.nativeEvent.layout.width;
    rootSize.height.value = e.nativeEvent.layout.height;
    scroll.value = activeIndex.value * e.nativeEvent.layout.width;
  };

  useDerivedValue(() => {
    onScroll?.(
      scroll.value,
      data.length * scrollDirection.value - scrollDirection.value
    );
  }, [scroll.value, data.length, scrollDirection]);

  useAnimatedReaction(
    () => activeIndex.value,
    (value) => onIndexChange && runOnJS(onIndexChange)(value),
    [activeIndex]
  );

  useAnimatedReaction(
    () => fetchIndex.value,
    (value) => runOnJS(setScrollIndex)(value),
    [fetchIndex]
  );

  useAnimatedReaction(
    () => vertical,
    (value) => {
      const direction = value ? rootSize.height.value : rootSize.width.value;
      scroll.value = activeIndex.value * direction;
    },
    [vertical, activeIndex, rootSize]
  );

  // Reference handling
  const setIndex = (index: number) => {
    const clamped = clamp(index, 0, data.length);
    activeIndex.value = clamped;
    fetchIndex.value = clamped;
    scroll.value = clamped * scrollDirection.value;
  };

  const requestState = () => ({
    width: rootChildSize.width.value,
    height: rootChildSize.height.value,
    translateX: translate.x.value,
    translateY: translate.y.value,
    scale: scale.value,
  });

  const reset = (animate = true) => {
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
            vertical={vertical}
            renderItem={renderItem}
            customTransition={customTransition}
          />
        );
      })}

      <Reflection
        maxScale={maxScale}
        scrollDirection={scrollDirection}
        length={data.length}
        vertical={vertical}
        tapOnEdgeToItem={tapOnEdgeToItem}
        allowPinchPanning={allowPinchPanning}
        pinchCenteringMode={pinchCenteringMode}
        onTap={onTap}
        onPanStart={onPanStart}
        onPanEnd={onPanEnd}
        onPinchStart={onPinchStart}
        onPinchEnd={onPinchEnd}
        onSwipe={onSwipe}
        onVerticalPull={onVerticalPull}
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
