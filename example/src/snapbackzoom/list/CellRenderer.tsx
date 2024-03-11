import React from 'react';
import Animated, {
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

type CellRendererProps = React.PropsWithChildren<{
  index: number;
  activeIndex: SharedValue<number>;
}>;

/*
 * Just like ScrollView, Flatlist renders its contents as siblings of each other, Flatlist
 * does it too, but with a small difference wraps its contents with a View, I think, such view
 * breaks the sibling relationship among the list items, therefore we need a custom implementation
 * of the wrapping view in a such a way we can recover the zIndex sibling relationship and assign in
 * a dynamic way.
 *
 * In order to keep maxinum performance, we just update a shared value with the index of item on the
 * list and apply a bigger zIndex if they both match
 */
const CellRenderer: React.FC<CellRendererProps> = ({
  children,
  index,
  activeIndex,
}) => {
  const zIndex = useDerivedValue(() => {
    return index === activeIndex.value ? 100 : 0;
  }, [activeIndex]);

  return <Animated.View style={{ zIndex }}>{children}</Animated.View>;
};

export default React.memo(CellRenderer);
