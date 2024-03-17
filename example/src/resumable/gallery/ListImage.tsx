import React, { useEffect, useRef } from 'react';
import { View, Image, useWindowDimensions, type ViewStyle } from 'react-native';
import {
  clamp,
  runOnJS,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {
  ResumableZoom,
  getAspectRatioSize,
  useImageResolution,
  type ResumableZoomType,
} from 'react-native-zoomable';

import { SCROLL_SIZE, TIMING_CONFIG, images } from './constants';
import { snapPoint, subscribeToIndexChangeEvent } from './utils';
import type { PanGestureEvent } from '../../../../src/commons/types';

type ListImageProps = {
  uri: string;
  index: number;
  onTap: () => void;
  scrollX: SharedValue<number>;
  scrollOffset: SharedValue<number>;
};

const ListImage: React.FC<ListImageProps> = ({
  uri,
  index,
  onTap,
  scrollX,
  scrollOffset,
}) => {
  const MAX_SCROLL_SIZE = SCROLL_SIZE * (images.length - 1);

  const ref = useRef<ResumableZoomType>(null);
  const { width, height } = useWindowDimensions();
  const { resolution } = useImageResolution({ uri });

  const isPortratit = height > width;
  const image = getAspectRatioSize({
    aspectRatio: (resolution?.width ?? 1) / (resolution?.height ?? 1),
    maxWidth: isPortratit ? SCROLL_SIZE : undefined,
    maxHeight: isPortratit ? undefined : height,
  });

  const reset = () => {
    ref.current?.reset(false);
  };

  // Updates the scroll value based on how much the pan gesture has been exceeded based on
  // its components boundaries
  const onBoundsExceeded = (bounds: number) => {
    'worklet';
    const toScroll = scrollOffset.value + bounds;
    scrollX.value = clamp(toScroll, 0, MAX_SCROLL_SIZE);
  };

  const clampScroll = (scroll: number) => {
    return clamp(scroll, 0, MAX_SCROLL_SIZE);
  };

  // on swipe scroll to the next item
  const swipeLeft = () => {
    const to = clampScroll(SCROLL_SIZE * (index + 1));
    scrollX.value = withTiming(to, TIMING_CONFIG, () => {
      scrollOffset.value = scrollX.value;
    });
  };

  // on swipe scroll to the previous item
  const swipeRight = () => {
    const to = clampScroll(SCROLL_SIZE * (index - 1));
    scrollX.value = withTiming(to, TIMING_CONFIG, () => {
      scrollOffset.value = scrollX.value;
    });
  };

  // if no swipe gesture has been detected  determine whether to scroll to next or previous item
  // scrollOffset is updated at the end of every animation so next time we start "scrolling" again
  // it will start where we left.
  const onPanEnd = (e: PanGestureEvent) => {
    const previous = SCROLL_SIZE * (index - 1);
    const current = SCROLL_SIZE * index;
    const upper = SCROLL_SIZE * (index + 1);

    if (scrollX.value > current) {
      const to = snapPoint(scrollX.value, e.velocityX, [current, upper]);
      const clampedScroll = clampScroll(to);

      scrollX.value = withTiming(clampedScroll, TIMING_CONFIG, () => {
        scrollOffset.value = scrollX.value;
        if (clampedScroll !== current) {
          runOnJS(reset)();
        }
      });
    }

    if (scrollX.value < current) {
      const to = snapPoint(scrollX.value, e.velocityX, [previous, current]);
      const clampedScroll = clampScroll(to);

      scrollX.value = withTiming(clampedScroll, TIMING_CONFIG, () => {
        scrollOffset.value = scrollX.value;
        if (clampedScroll !== current) {
          runOnJS(reset)();
        }
      });
    }
  };

  useEffect(() => {
    const sub = subscribeToIndexChangeEvent((currentIndex) => {
      if (currentIndex !== index) {
        ref.current?.reset(false);
      }
    });

    return () => {
      sub.remove();
    };
  }, [ref, index]);

  useEffect(() => {
    ref.current?.reset(false);
  }, [width, height]);

  const rootStyle: ViewStyle = {
    width,
    height,
    overflow: 'hidden',
  };

  return (
    <View style={rootStyle}>
      <ResumableZoom
        ref={ref}
        maxScale={resolution}
        onTap={onTap}
        onPanEnd={onPanEnd}
        onSwipeLeft={swipeLeft}
        onSwipeRight={swipeRight}
        onHorizontalBoundsExceeded={onBoundsExceeded}
      >
        <Image
          source={{ uri }}
          style={image}
          resizeMode={'cover'}
          resizeMethod={'scale'}
        />
      </ResumableZoom>
    </View>
  );
};

export default ListImage;
