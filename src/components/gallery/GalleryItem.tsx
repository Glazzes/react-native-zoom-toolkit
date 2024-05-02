import React from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { useVector } from '../../commons/hooks/useVector';
import type { SizeVector, Vector } from '../../commons/types';

type GalleryItemProps = React.PropsWithChildren<{
  index: number;
  count: number;
  scroll: SharedValue<number>;
  activeIndex: SharedValue<number>;
  rootSize: SizeVector<SharedValue<number>>;
  rootChild: SizeVector<SharedValue<number>>;
  translate: Vector<SharedValue<number>>;
  scale: SharedValue<number>;
  isScrolling: SharedValue<boolean>;
}>;

const GalleryItem: React.FC<GalleryItemProps> = ({
  children,
  count,
  scroll,
  index,
  activeIndex,
  rootChild,
  rootSize,
  translate,
  scale,
  isScrolling,
}) => {
  const childSize = useSizeVector(0, 0);
  const innerTranslate = useVector(0, 0);
  const innerScale = useSharedValue<number>(1);

  const measureChild = (e: LayoutChangeEvent) => {
    childSize.width.value = e.nativeEvent.layout.width;
    childSize.height.value = e.nativeEvent.layout.height;

    if (index === activeIndex.value) {
      rootChild.width.value = e.nativeEvent.layout.width;
      rootChild.height.value = e.nativeEvent.layout.height;
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
  });

  const animatedStyle = useAnimatedStyle(() => {
    if (index < activeIndex.value - 1 || index > activeIndex.value + 1) {
      return {
        opacity: 0,
        transform: [{ translateX: 0 }, { scale: 0 }],
      };
    }

    let translateX = index * rootSize.width.value - scroll.value;
    let opacity = 1;
    let sc = 1;
    if (index !== activeIndex.value && !isScrolling.value) sc = 0;

    const isCurrent = index === activeIndex.value;
    const isNext = index === activeIndex.value + 1;
    if (isNext || (isCurrent && scroll.value < index * rootSize.width.value)) {
      opacity = interpolate(
        scroll.value,
        [(index - 1) * rootSize.width.value, index * rootSize.width.value],
        [0, 1],
        Extrapolation.CLAMP
      );

      sc = 0.75 + 0.25 * opacity;
      translateX = 0;
    }

    return {
      opacity,
      transform: [{ translateX }, { scale: sc }],
    };
  });

  useDerivedValue(() => {
    if (index === activeIndex.value) {
      innerTranslate.x.value = translate.x.value;
      innerTranslate.y.value = translate.y.value;
      innerScale.value = scale.value;
    }
  }, [activeIndex, translate, scale]);

  useAnimatedReaction(
    () => activeIndex.value,
    (value) => {
      if (index === value) {
        rootChild.width.value = childSize.width.value;
        rootChild.height.value = childSize.height.value;
      } else {
        innerTranslate.x.value = 0;
        innerTranslate.y.value = 0;
        innerScale.value = 1;
      }
    },
    [activeIndex]
  );

  return (
    <Animated.View
      style={[styles.root, { zIndex: count - index }, animatedStyle]}
    >
      <Animated.View style={childStyle} onLayout={measureChild}>
        {children}
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
  },
});

export default React.memo(GalleryItem);
