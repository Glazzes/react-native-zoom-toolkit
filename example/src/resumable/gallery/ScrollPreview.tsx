import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { emitIndexChangeEvent } from './utils';
import PreviewImage from './PreviewImage';
import { theme } from '../../constants';
import { PREVIEW_SIZE, TIMING_CONFIG, images } from './constants';

type ScrollPreviewProps = {
  translateY: SharedValue<number>;
  scrollX: SharedValue<number>;
  scrollOffset: SharedValue<number>;
};

const ScrollPreview: React.FC<ScrollPreviewProps> = ({
  translateY,
  scrollX,
  scrollOffset,
}) => {
  const { width } = useWindowDimensions();

  const internalScrollX = useSharedValue<number>(0);
  useAnimatedReaction(
    () => scrollX.value,
    (value): void => {
      internalScrollX.value = withTiming(value, TIMING_CONFIG);
    }
  );

  // Go to the image the user wants to see, and signal what is the current index so previous
  // images will reset its transformations to their initail state.
  const scrollTo = (index: number) => {
    const scrollWidth = width * index;
    scrollX.value = scrollWidth;
    scrollOffset.value = scrollWidth;
    emitIndexChangeEvent(index);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -1 * translateY.value }],
  }));

  const previewContainerStyle = useAnimatedStyle(() => {
    const scrollFraction = internalScrollX.value / width;
    const toX = -1 * (PREVIEW_SIZE + theme.spacing.s) * scrollFraction;

    return {
      transform: [{ translateX: toX }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, styles.root]}>
      <View style={styles.placeholder} />
      <Animated.View style={[previewContainerStyle, styles.preiewContainer]}>
        {images.map((uri, index) => {
          return (
            <PreviewImage
              key={uri}
              uri={uri}
              index={index}
              scrollTo={scrollTo}
            />
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: theme.spacing.s,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    bottom: 0,
  },
  placeholder: {
    flex: 1,
  },
  preiewContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.s,
  },
});

export default ScrollPreview;
