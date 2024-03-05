import React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useVector } from '../commons/hooks/useVector';
import { useSizeVector } from '../commons/hooks/useSizeVector';
import { DEFAULT_HITSLOP } from '../constants';
import { resizeToAspectRatio } from '../commons/utils/resizeToAspectRatio';

import type {
  CommonZoomCallbackProps,
  CommonZoomProps,
  ResizeConfig,
} from '../types';

type Props = {
  resizeConfig?: ResizeConfig;
  gesturesEnabled?: boolean;
  onGestureEnd?: () => void;
};

type SnapBackZoomProps = React.PropsWithChildren<Props> &
  CommonZoomProps &
  CommonZoomCallbackProps;

const SnapBackZoom: React.FC<SnapBackZoomProps> = ({
  children,
  hitSlop = DEFAULT_HITSLOP,
  resizeConfig,
  timingConfig,
  gesturesEnabled = true,
  onTap,
  onDoubleTap,
  onPinchStart,
  onPinchEnd,
  onGestureActive,
  onGestureEnd,
}) => {
  const position = useVector(0, 0);

  const childrenSize = useSizeVector(0, 0);
  const containerSize = useSizeVector(
    resizeConfig?.size.width ?? 0,
    resizeConfig?.size.height ?? 0
  );

  const translate = useVector(0, 0);
  const origin = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const isPinchActive = useSharedValue<boolean>(false);

  const containerRef = useAnimatedRef();
  const measurePinchContainer = () => {
    'worklet';

    const measuremet = measure(containerRef);
    if (measuremet !== null) {
      containerSize.width.value = measuremet.width;
      containerSize.height.value = measuremet.height;
      position.x.value = measuremet.pageX;
      position.y.value = measuremet.pageY;
    }
  };

  useDerivedValue(() => {
    onGestureActive?.({
      x: position.x.value,
      y: position.y.value,
      width: containerSize.width.value,
      height: containerSize.height.value,
      resizedWidth: childrenSize.width.value,
      resizedHeight: childrenSize.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
    });
  }, [position, translate, scale, containerSize, childrenSize, isPinchActive]);

  const pinch = Gesture.Pinch()
    .hitSlop(hitSlop)
    .enabled(gesturesEnabled)
    .onStart((e) => {
      if (onPinchStart !== undefined) {
        runOnJS(onPinchStart)(e);
      }

      measurePinchContainer();
      origin.x.value = e.focalX - containerSize.width.value / 2;
      origin.y.value = e.focalY - containerSize.height.value / 2;
      isPinchActive.value = true;
    })
    .onUpdate((e) => {
      const deltaX = e.focalX - containerSize.width.value / 2 - origin.x.value;
      const deltaY = e.focalY - containerSize.height.value / 2 - origin.y.value;

      const toX = -1 * (origin.x.value * e.scale - origin.x.value) + deltaX;
      const toY = -1 * (origin.y.value * e.scale - origin.y.value) + deltaY;

      translate.x.value = toX;
      translate.y.value = toY;
      scale.value = e.scale;
    })
    .onEnd((e, success) => {
      if (onPinchEnd !== undefined) {
        runOnJS(onPinchEnd)(e, success);
      }

      translate.x.value = withTiming(0, timingConfig);
      translate.y.value = withTiming(0, timingConfig);
      scale.value = withTiming(1, timingConfig, (_) => {
        isPinchActive.value = false;

        if (onGestureEnd !== undefined) {
          runOnJS(onGestureEnd)();
        }
      });
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .enabled(gesturesEnabled)
    .onEnd((e) => {
      if (onTap !== undefined) {
        runOnJS(onTap)(e);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .enabled(gesturesEnabled)
    .onEnd((e) => {
      if (onDoubleTap !== undefined) {
        runOnJS(onDoubleTap)(e);
      }
    });

  const composedTapGesture = Gesture.Exclusive(doubleTap, tap);

  const containerStyle = useAnimatedStyle(() => {
    const width = containerSize.width.value;
    const height = containerSize.height.value;

    return {
      width: width === 0 ? undefined : containerSize.width.value,
      height: height === 0 ? undefined : containerSize.height.value,
    };
  });

  const childrenStyle = useAnimatedStyle(() => {
    const resized = resizeToAspectRatio({
      resizeConfig,
      width: containerSize.width.value,
      height: containerSize.height.value,
      scale: scale.value,
    });

    const { width: finalWidth, height: finalHeight, deltaX, deltaY } = resized;
    childrenSize.width.value = finalWidth;
    childrenSize.height.value = finalHeight;

    return {
      width: finalWidth === 0 ? undefined : finalWidth,
      height: finalHeight === 0 ? undefined : finalHeight,
      transform: [
        { translateX: translate.x.value - deltaX },
        { translateY: translate.y.value - deltaY },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[containerStyle, styles.center]}>
      <GestureDetector gesture={Gesture.Race(pinch, composedTapGesture)}>
        <Animated.View
          pointerEvents={gesturesEnabled ? undefined : 'none'}
          style={styles.absolute}
        />
      </GestureDetector>

      <Animated.View ref={containerRef} style={childrenStyle}>
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 1,
  },
});

export default SnapBackZoom;
