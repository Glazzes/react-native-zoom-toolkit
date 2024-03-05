import React, { useContext } from 'react';
import { Image, StyleSheet, View, type ImageStyle } from 'react-native';
import { maxDimension, theme } from '../../constants';
import {
  SnapBackZoom,
  useImageSize,
  getAspectRatioSize,
  type ResizeConfig,
} from '../../../../src';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { ReflectionContext } from '../reflection/ReflectionContext';

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
  const { size } = useImageSize({ uri });

  const aspectRatio =
    size === undefined ? 1 : (size?.width ?? 1) / (size?.height ?? 1);
  const { width: imageWidth, height: imageHeight } = getAspectRatioSize({
    aspectRatio,
    maxWidth: 250,
  });

  const resizeConfig: ResizeConfig = {
    size: { width: 200, height: 200 },
    aspectRatio,
    scale: 1.75,
  };

  const imageStyle: ImageStyle = {
    width: imageWidth,
    height: imageHeight,
    borderRadius: 8,
  };

  const animatedRef = useAnimatedRef();
  const backgroundColor = useSharedValue<string>(theme.colors.userMessage);
  const {
    width,
    height,
    backgroundColor: reflectionColor,
    x,
    y,
  } = useContext(ReflectionContext);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
    borderRadius: 8,
    padding: theme.spacing.xs / 2,
  }));

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
    activeIndex.value = index;
    reflectionColor.value = backgroundColor.value;

    runOnUI(() => {
      'worklet';
      const measurement = measure(animatedRef);
      if (measurement) {
        width.value = measurement.width;
        height.value = measurement.height;
        x.value = measurement.pageX;
        y.value = measurement.pageY;
      }

      backgroundColor.value = 'transparent';
    })();
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

  return (
    <View style={styles.container}>
      <Animated.View ref={animatedRef} style={animatedStyle}>
        <SnapBackZoom
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
        </SnapBackZoom>
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
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default React.memo(ImageMessage);
