import React, { useContext, useImperativeHandle, useState } from 'react';
import { type LayoutChangeEvent } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { clamp } from '../../commons/utils/clamp';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { getScrollPosition } from '../../commons/utils/getScrollPosition';

import GalleryGestureHandler from './GalleryGestureHandler';
import GalleryItem from './GalleryItem';
import { GalleryContext } from './context';
import { type GalleryProps, type GalleryType } from './types';

type GalleryPropsWithRef<T> = GalleryProps<T> & {
  reference?: React.ForwardedRef<GalleryType>;
};

const Gallery = <T,>(props: GalleryPropsWithRef<T>) => {
  const {
    reference,
    data,
    renderItem,
    keyExtractor,
    initialIndex = 0,
    windowSize = 5,
    maxScale: userMaxScale = 6,
    vertical = false,
    gap = 0,
    allowOverflow = false,
    tapOnEdgeToItem = true,
    zoomEnabled = true,
    scaleMode = 'bounce',
    pinchCenteringMode = 'clamp',
    allowPinchPanning = true,
    customTransition,
    onIndexChange,
    onScroll,
    onTap,
    onUpdate,
    onPanStart,
    onPanEnd,
    onPinchStart,
    onPinchEnd,
    onSwipe,
    onZoomBegin,
    onZoomEnd,
    onVerticalPull,
    onGestureEnd,
  } = props;

  const {
    activeIndex,
    rootSize,
    rootChildSize,
    scroll,
    translate,
    scale,
    hasZoomed,
    overflow,
  } = useContext(GalleryContext);

  const nextItems = Math.floor(windowSize / 2);
  const [scrollIndex, setScrollIndex] = useState<number>(initialIndex);

  const itemSize = useDerivedValue(() => {
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
    const { width, height } = e.nativeEvent.layout;
    const scrollPosition = getScrollPosition({
      index: activeIndex.get(),
      itemSize: vertical ? height : width,
      gap,
    });

    rootSize.width.set(width);
    rootSize.height.set(height);
    scroll.set(scrollPosition);
  };

  const animatedStyles = useAnimatedStyle(
    () => ({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: overflow.value,
    }),
    [overflow]
  );

  useAnimatedReaction(
    () => ({ scroll: scroll.value, itemSize: itemSize.value }),
    (value) => onScroll?.(value.scroll, (data.length - 1) * value.itemSize),
    [scroll, itemSize]
  );

  useAnimatedReaction(
    () => ({
      width: rootChildSize.width.value,
      height: rootChildSize.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
    }),
    (state) => onUpdate && onUpdate(state),
    [rootChildSize, translate, scale]
  );

  useAnimatedReaction(
    () => activeIndex.value,
    (value) => {
      onIndexChange && runOnJS(onIndexChange)(value);
      runOnJS(setScrollIndex)(value);
    },
    [activeIndex]
  );

  useAnimatedReaction(
    () => ({
      vertical,
      size: { width: rootSize.width.value, height: rootSize.height.value },
    }),
    (value) => {
      scroll.value = getScrollPosition({
        index: activeIndex.value,
        itemSize: value.vertical ? value.size.height : value.size.width,
        gap,
      });
    },
    [vertical, rootSize]
  );

  useAnimatedReaction(
    () => scale.value,
    (value, previousValue) => {
      if (value !== 1 && !hasZoomed.value) {
        hasZoomed.value = true;
        onZoomBegin && runOnJS(onZoomBegin)(activeIndex.value);
      } else if (value === 1 && previousValue !== 1 && hasZoomed.value) {
        hasZoomed.value = false;
        onZoomEnd && runOnJS(onZoomEnd)(activeIndex.value);
      }
    },
    [scale]
  );

  // Reference handling
  const setIndex = (index: number) => {
    const clamped = clamp(index, 0, data.length - 1);
    activeIndex.value = clamped;

    scroll.value = getScrollPosition({
      index: activeIndex.get(),
      itemSize: itemSize.get(),
      gap,
    });
  };

  const requestState = () => ({
    width: rootChildSize.width.get(),
    height: rootChildSize.height.get(),
    translateX: translate.x.get(),
    translateY: translate.y.get(),
    scale: scale.get(),
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
    <Animated.View
      testID={'root'}
      style={animatedStyles}
      onLayout={measureRoot}
    >
      {data.map((item, index) => {
        const inLowerHalf = index < scrollIndex - nextItems;
        const inUpperHalf = index > scrollIndex + nextItems;
        if (inLowerHalf || inUpperHalf) return null;

        const key = keyExtractor?.(item, index) ?? `item-${index}`;

        return (
          <GalleryItem
            key={key}
            zIndex={data.length - index}
            index={index}
            gap={gap}
            item={item}
            vertical={vertical}
            renderItem={renderItem}
            customTransition={customTransition}
          />
        );
      })}

      <GalleryGestureHandler
        gap={gap}
        maxScale={maxScale}
        itemSize={itemSize}
        length={data.length}
        vertical={vertical}
        tapOnEdgeToItem={tapOnEdgeToItem}
        zoomEnabled={zoomEnabled}
        scaleMode={scaleMode}
        allowOverflow={allowOverflow}
        allowPinchPanning={allowPinchPanning}
        pinchCenteringMode={pinchCenteringMode}
        onTap={onTap}
        onPanStart={onPanStart}
        onPanEnd={onPanEnd}
        onPinchStart={onPinchStart}
        onPinchEnd={onPinchEnd}
        onSwipe={onSwipe}
        onVerticalPull={onVerticalPull}
        onGestureEnd={onGestureEnd}
      />
    </Animated.View>
  );
};

export default Gallery;
