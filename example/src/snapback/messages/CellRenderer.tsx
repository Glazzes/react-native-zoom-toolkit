import React from 'react';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

type CellRendererProps = React.PropsWithChildren<{
  index: number;
  activeIndex: SharedValue<number>;
}>;

const CellRenderer: React.FC<CellRendererProps> = ({
  children,
  index,
  activeIndex,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      zIndex: index === activeIndex.value ? 100 : 0,
    };
  }, [activeIndex, index]);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default React.memo(CellRenderer);
