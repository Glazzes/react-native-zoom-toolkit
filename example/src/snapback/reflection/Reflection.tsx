import React, { useContext } from 'react';
import { ReflectionContext } from './ReflectionContext';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

/*
 * This component is a "reflection" of the background seen in the meassages, once you pinch
 * a measurement of the pinched component is taken in order to update the values of ReflectionContext
 * so they can be used here.
 *
 * Why do we need this reflection? Each message has a background around it, when we pinch such component
 * the entire component needs to update its zIndex value, because of the parent-child relationship
 * of the zIndex property, this background will overlay the appbar, giving a poor user experience
 */
const Reflection: React.FC = () => {
  const context = useContext(ReflectionContext);
  const { width, height, backgroundColor, x, y } = context;

  const style = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
    backgroundColor: backgroundColor.value,
    borderRadius: 8,
    position: 'absolute',
    top: y.value,
    left: x.value,
  }));

  return <Animated.View style={style} />;
};

export default Reflection;
