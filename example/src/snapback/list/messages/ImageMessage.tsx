import React, { useContext } from 'react';
import { Image, StyleSheet, View, type ImageStyle } from 'react-native';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import {
  SnapbackZoom,
  useImageResolution,
  type ResizeConfig,
  type SizeVector,
} from 'react-native-zoom-toolkit';

import { maxDimension, theme } from '../../../constants';
import { ReflectionContext } from '../../context';

type ImageMessageProps = {
  uri: string;
  index: number;
  activeIndex: SharedValue<number>;
  useResizeConfig: boolean;
};

const ImageMessage: React.FC<ImageMessageProps> = ({
  uri,
  index,
  activeIndex,
  useResizeConfig,
}) => {
  const animatedRef = useAnimatedRef();

  const {
    width,
    height,
    backgroundColor: reflectionColor,
    x,
    y,
  } = useContext(ReflectionContext);
  const backgroundColor = useSharedValue<string>(theme.colors.userMessage);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
    borderRadius: theme.spacing.s,
    padding: theme.spacing.xs / 2,
  }));

  const { isFetching, resolution } = useImageResolution({ uri });
  if (isFetching || resolution === undefined) {
    return null;
  }

  const aspectRatio = resolution.width / resolution.height;
  const size: SizeVector<number> = {
    width: 250,
    height: 250 / aspectRatio,
  };

  const resizeConfig: ResizeConfig = {
    size: { width: 200, height: 200 },
    aspectRatio,
    scale: 1.75,
  };

  /*
   * Updates the values seen in Reflection context based on the current dimensions and position
   * of our message.
   *
   * Updates the active index for CellRenderer component to grant a higer zIndex value.
   *
   * Makes the current background transparent so it can no be seen, then the reflection takes
   * its place.
   */
  const onPinchStart = () => {
    'worklet';
    activeIndex.value = index;

    reflectionColor.value = backgroundColor.value;

    const measurement = measure(animatedRef);
    if (measurement) {
      width.value = measurement.width;
      height.value = measurement.height;
      x.value = measurement.pageX;
      y.value = measurement.pageY;
    }

    backgroundColor.value = 'transparent';
  };

  /*
   * Sends the reflection out of the screen.
   * Updates the active index to a negative value so no message's index matches.
   * changes the background color of this component back to the one it started with.
   */
  const onGestureEnd = () => {
    backgroundColor.value = theme.colors.userMessage;
    activeIndex.value = -1;
    x.value = -1 * maxDimension;
    y.value = -1 * maxDimension;
  };

  const imageStyle: ImageStyle = {
    width: size.width,
    height: size.height,
    borderRadius: theme.spacing.s,
  };

  return (
    <View style={styles.container}>
      <Animated.View ref={animatedRef} style={animatedStyle}>
        <SnapbackZoom
          hitSlop={{ vertical: 20, horizontal: 20 }}
          resizeConfig={useResizeConfig ? resizeConfig : undefined}
          onPinchStart={onPinchStart}
          onGestureEnd={onGestureEnd}
        >
          <Image
            source={{ uri }}
            style={useResizeConfig ? styles.flex : imageStyle}
            resizeMode="cover"
            resizeMethod="scale"
          />
        </SnapbackZoom>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  image: {
    width: 250,
    height: 250 / 1.5,
    borderRadius: 8,
  },
  flex: {
    flex: 1,
    borderRadius: 8,
  },
});

export default React.memo(ImageMessage);
