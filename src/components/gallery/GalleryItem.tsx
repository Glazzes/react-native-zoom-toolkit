import React, { useContext } from 'react';
import { type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useVector } from '../../commons/hooks/useVector';
import { useSizeVector } from '../../commons/hooks/useSizeVector';

import { GalleryContext } from './context';
import type { GalleryTransitionCallback } from './types';

type GalleryItemProps = {
  item: any;
  index: number;
  gap: number;
  zIndex: number;
  vertical: boolean;
  renderItem: (item: any, index: number) => React.ReactElement;
  customTransition?: GalleryTransitionCallback;
};

const GalleryItem = ({
  index,
  gap,
  zIndex,
  item,
  vertical,
  renderItem,
  customTransition,
}: GalleryItemProps) => {
  const {
    rootSize,
    rootChildSize,
    activeIndex,
    scroll,
    isScrolling,
    translate,
    scale,
    overflow,
    hideAdjacentItems,
  } = useContext(GalleryContext);

  const innerSize = useSizeVector(0, 0);
  const innerTranslate = useVector(0, 0);
  const innerScale = useSharedValue<number>(1);

  const measureChild = (e: LayoutChangeEvent) => {
    innerSize.width.value = e.nativeEvent.layout.width;
    innerSize.height.value = e.nativeEvent.layout.height;

    if (index === activeIndex.value) {
      rootChildSize.width.value = e.nativeEvent.layout.width;
      rootChildSize.height.value = e.nativeEvent.layout.height;
    }
  };

  const childStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: innerTranslate.x.value },
        { translateY: innerTranslate.y.value },
        { scale: innerScale.value },
      ],
    };
  }, [innerTranslate, innerScale]);

  const animatedRootStyles = useAnimatedStyle(
    () => ({
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      overflow: overflow.value,
      opacity: activeIndex.value !== index && hideAdjacentItems.value ? 0 : 1,
    }),
    [overflow, activeIndex, index, hideAdjacentItems]
  );

  // @ts-ignore
  const transitionStyle = useAnimatedStyle(() => {
    if (customTransition !== undefined) {
      return customTransition({
        index,
        gap,
        activeIndex: activeIndex.value,
        isScrolling: isScrolling.value,
        direction: vertical ? 'vertical' : 'horizontal',
        scroll: scroll.value,
        gallerySize: {
          width: rootSize.width.value,
          height: rootSize.height.value,
        },
      });
    }

    const currentScroll = -1 * scroll.value + index * gap;

    const isSizeNotDefined =
      rootSize.width.value === 0 && rootSize.height.value === 0;
    const opacity = isSizeNotDefined && index !== activeIndex.value ? 0 : 1;

    if (vertical) {
      const translateY = index * rootSize.height.value + currentScroll;
      return { transform: [{ translateY }], opacity };
    }

    const translateX = index * rootSize.width.value + currentScroll;
    return { transform: [{ translateX }], opacity };
  });

  useAnimatedReaction(
    () => ({
      activeIndex: activeIndex.value,
      translate: { x: translate.x.value, y: translate.y.value },
      scale: scale.value,
    }),
    (current) => {
      if (index !== current.activeIndex) return;
      innerTranslate.x.value = current.translate.x;
      innerTranslate.y.value = current.translate.y;
      innerScale.value = current.scale;
    },
    [activeIndex, translate, scale]
  );

  useAnimatedReaction(
    () => activeIndex.value,
    (value) => {
      if (index === value) {
        rootChildSize.width.value = innerSize.width.value;
        rootChildSize.height.value = innerSize.height.value;
      } else {
        innerTranslate.x.value = 0;
        innerTranslate.y.value = 0;
        innerScale.value = 1;
      }
    },
    [activeIndex, innerSize]
  );

  return (
    <Animated.View
      testID={`child-${index}`}
      // @ts-ignore
      style={[animatedRootStyles, transitionStyle, { zIndex }]}
    >
      <Animated.View style={childStyle} onLayout={measureChild}>
        {renderItem(item, index)}
      </Animated.View>
    </Animated.View>
  );
};

export default React.memo(GalleryItem, (prev, next) => {
  return (
    prev.index === next.index &&
    prev.gap === next.gap &&
    prev.zIndex === next.zIndex &&
    prev.vertical === next.vertical &&
    prev.customTransition === next.customTransition &&
    prev.renderItem === next.renderItem
  );
});
