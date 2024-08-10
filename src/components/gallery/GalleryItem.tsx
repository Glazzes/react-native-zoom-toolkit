import React, { useContext } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { useVector } from '../../commons/hooks/useVector';
import { GalleryContext } from './context';
import type { GalleryTransitionCallback } from './types';

type GalleryItemProps = {
  item: any;
  index: number;
  zIndex: number;
  vertical: boolean;
  renderItem: (item: any, index: number) => React.ReactElement;
  customTransition?: GalleryTransitionCallback;
};

const GalleryItem: React.FC<GalleryItemProps> = ({
  index,
  zIndex,
  item,
  vertical,
  renderItem,
  customTransition,
}) => {
  const {
    rootSize,
    rootChildSize,
    activeIndex,
    scroll,
    isScrolling,
    translate,
    scale,
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

  const transitionStyle = useAnimatedStyle(() => {
    if (customTransition !== undefined) {
      return customTransition({
        index,
        activeIndex: activeIndex.value,
        isScrolling: isScrolling.value,
        vertical,
        scroll: scroll.value,
        gallerySize: {
          width: rootSize.width.value,
          height: rootSize.height.value,
        },
      });
    }

    const sizeNotDefined =
      rootSize.width.value === 0 && rootSize.height.value === 0;
    const opacity = sizeNotDefined && index !== activeIndex.value ? 0 : 1;

    if (vertical) {
      const translateY = index * rootSize.height.value - scroll.value;
      return { transform: [{ translateY }], opacity };
    }

    const translateX = index * rootSize.width.value - scroll.value;
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
    <Animated.View style={[styles.root, transitionStyle, { zIndex }]}>
      <Animated.View style={childStyle} onLayout={measureChild}>
        {renderItem(item, index)}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default React.memo(GalleryItem, (prev, next) => {
  return (
    prev.index === next.index &&
    prev.zIndex === next.zIndex &&
    prev.vertical === next.vertical &&
    prev.customTransition === next.customTransition &&
    prev.renderItem === next.renderItem
  );
});
