import React from 'react';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

type CellRendererProps = React.PropsWithChildren<{
  index: number;
  activeIndex: SharedValue<number>;
}>;

/*
 * Just like ScrollView, Flatlist renders its contents as siblings of each other, Flatlist
 * does it as well with a small difference, it wraps its contents with a simple View, such view
 * breaks the sibling relationship among the list items, therefore we need a custom implementation
 * of the wrapping view in a such a way we can recover the zIndex sibling relationship and assign it
 * in a dynamic way.
 *
 * In order to keep maximum performance, we just update a shared value with the index of item on the
 * list and apply a bigger zIndex if they both match
 */
const CellRenderer: React.FC<CellRendererProps> = ({
  children,
  index,
  activeIndex,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return { zIndex: index === activeIndex.value ? 100 : 0 };
  }, [index, activeIndex]);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default CellRenderer;
