import React, { useContext } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { useVector } from '../../commons/hooks/useVector';
import { GalleryContext } from './context';

type GalleryItemProps = {
  index: number;
  item: any;
  renderItem: (item: any, index: number) => React.ReactElement;
  count: number;
};

const GalleryItem: React.FC<GalleryItemProps> = ({
  count,
  index,
  item,
  renderItem,
}) => {
  const { rootSize, activeIndex, rootChildSize, scroll, translate, scale } =
    useContext(GalleryContext);

  const childSize = useSizeVector(0, 0);
  const innerTranslate = useVector(0, 0);
  const innerScale = useSharedValue<number>(1);

  const measureChild = (e: LayoutChangeEvent) => {
    childSize.width.value = e.nativeEvent.layout.width;
    childSize.height.value = e.nativeEvent.layout.height;

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
  });

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = index * rootSize.width.value - scroll.x.value;
    const opacity = rootSize.width.value === 0 && index !== 0 ? 0 : 1;

    return { transform: [{ translateX }], opacity };
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
        rootChildSize.width.value = childSize.width.value;
        rootChildSize.height.value = childSize.height.value;
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
  },
});

export default React.memo(GalleryItem, (prev, next) => {
  return (
    prev.count === next.count &&
    prev.index === next.index &&
    prev.renderItem === next.renderItem
  );
});
