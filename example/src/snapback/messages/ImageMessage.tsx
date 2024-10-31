import React, { useContext } from 'react';
import { Image, StyleSheet, View, type ImageStyle } from 'react-native';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import {
  SnapbackZoom,
  useImageResolution,
  getAspectRatioSize,
  type ResizeConfig,
} from 'react-native-zoom-toolkit';
import { maxDimension, theme } from '../../constants';
import { ReflectionContext } from '../reflection/ReflectionContext';
import CellRenderer from './CellRenderer';

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

  const { isFetching, resolution } = useImageResolution({ uri });
  const aspectRatio = isFetching
    ? 1
    : (resolution?.width ?? 1) / (resolution?.height ?? 1);

  const { width: imageWidth, height: imageHeight } = getAspectRatioSize({
    aspectRatio,
    width: 250,
  });

  const resizeConfig: ResizeConfig = {
    size: { width: 200, height: 200 },
    aspectRatio,
    scale: 1.75,
  };

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

  const onGestureEnd = () => {
    backgroundColor.value = theme.colors.userMessage;
    activeIndex.value = -1;
    x.value = -1 * maxDimension;
    y.value = -1 * maxDimension;
  };

  const imageStyle: ImageStyle = {
    width: imageWidth,
    height: imageHeight,
    borderRadius: theme.spacing.s,
  };

  return (
    <CellRenderer index={index} activeIndex={activeIndex}>
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
    </CellRenderer>
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
