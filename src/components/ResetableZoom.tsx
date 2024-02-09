import React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type {
  CommonZoomCallbacks,
  CommonZoomProps,
  CanvasSize,
} from '../types';
import { useVector } from '../hooks/useVector';
import { DEFAULT_HITSLOP } from '../constants';

type ResizeConfig = {
  size: CanvasSize;
  aspectRatio: number;
  scale: number;
};

type ResetableZoomProps = {
  resizeConfig?: ResizeConfig;
  gesturesEnabled?: boolean;
} & CommonZoomProps &
  CommonZoomCallbacks;

const ResetableZoom: React.FC<ResetableZoomProps> = ({
  children,
  resizeConfig,
  zIndex: zIndexByUser = 0,
  hitSlop = DEFAULT_HITSLOP,
  timingConfig,
  gesturesEnabled = true,
  onTap,
  onDoubleTap,
  onPinchStart,
  onPinchEnd,
}) => {
  const width = useSharedValue<number | undefined>(resizeConfig?.size.width);
  const height = useSharedValue<number | undefined>(resizeConfig?.size.height);

  const translate = useVector(0, 0);
  const origin = useVector(0, 0);

  const scale = useSharedValue<number>(1);
  const zIndex = useSharedValue<number>(0);

  const pinch = Gesture.Pinch()
    .hitSlop(hitSlop)
    .enabled(gesturesEnabled)
    .onStart((e) => {
      if (onPinchStart) {
        runOnJS(onPinchStart)(e);
      }

      zIndex.value = zIndexByUser;
      origin.x.value = e.focalX - (width.value ?? 0) / 2;
      origin.y.value = e.focalY - (height.value ?? 0) / 2;
    })
    .onChange((e) => {
      const dx = e.focalX - (width.value ?? 0) / 2 - origin.x.value;
      const dy = e.focalY - (height.value ?? 0) / 2 - origin.y.value;

      const toX = -1 * (origin.x.value * e.scale - origin.x.value) + dx;
      const toY = -1 * (origin.y.value * e.scale - origin.y.value) + dy;

      translate.x.value = toX;
      translate.y.value = toY;
      scale.value = e.scale;
    })
    .onEnd((e, success) => {
      if (onPinchEnd) {
        runOnJS(onPinchEnd)(e, success);
      }

      translate.x.value = withTiming(0, timingConfig);
      translate.y.value = withTiming(0, timingConfig);
      scale.value = withTiming(1, timingConfig, (finished) => {
        if (finished) {
          zIndex.value = 0;
        }
      });
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .enabled(gesturesEnabled)
    .onStart((e) => {
      if (onTap) {
        runOnJS(onTap)(e);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .enabled(gesturesEnabled)
    .onStart((e) => {
      if (onDoubleTap) {
        runOnJS(onDoubleTap)(e);
      }
    });

  const composedTapGesture = Gesture.Exclusive(doubleTap, tap);

  const dummyStyles = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
    position: 'absolute',
  }));

  const animatedStyle = useAnimatedStyle(() => {
    let endWidth = width.value ?? 0;
    let endHeight = height.value ?? 0;
    if (resizeConfig !== undefined) {
      const { size, aspectRatio, scale: maxScale } = resizeConfig;
      const isWide = aspectRatio > 1;

      endWidth = isWide
        ? interpolate(
            scale.value,
            [1, maxScale],
            [size.width, size.height * aspectRatio],
            Extrapolation.CLAMP
          )
        : size.width;

      endHeight = isWide
        ? size.height
        : interpolate(
            scale.value,
            [1, maxScale],
            [size.height, size.width / aspectRatio],
            Extrapolation.CLAMP
          );
    }

    if (endWidth === 0 && endHeight === 0) {
      return {
        width: undefined,
        height: undefined,
      };
    }

    const diffX = (endWidth - (width.value ?? 0)) / 2;
    const diffY = (endHeight - (height.value ?? 0)) / 2;

    return {
      width: endWidth,
      height: endHeight,
      zIndex: zIndex.value,
      transform: [
        { translateX: translate.x.value - diffX },
        { translateY: translate.y.value - diffY },
        { scale: scale.value },
      ],
    };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    width.value = e.nativeEvent.layout.width;
    height.value = e.nativeEvent.layout.height;
  };

  return (
    <View>
      <Animated.View style={animatedStyle}>
        <View onLayout={onLayout} collapsable={false}>
          {children}
        </View>
      </Animated.View>
      <GestureDetector gesture={Gesture.Race(pinch, composedTapGesture)}>
        <Animated.View
          pointerEvents={gesturesEnabled ? undefined : 'none'}
          style={dummyStyles}
        />
      </GestureDetector>
    </View>
  );
};

export default ResetableZoom;
