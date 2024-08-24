import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useVector } from '../../commons/hooks/useVector';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { resizeToAspectRatio } from '../../commons/utils/resizeToAspectRatio';
import withSnapbackValidation from '../../commons/hoc/withSnapbackValidation';

import type { SnapBackZoomProps } from './types';

const DEFAULT_HITSLOP = { vertical: 0, horizontal: 0 };

const SnapbackZoom: React.FC<SnapBackZoomProps> = ({
  children,
  hitSlop = DEFAULT_HITSLOP,
  resizeConfig,
  timingConfig,
  gesturesEnabled = true,
  onTap,
  onDoubleTap,
  onPinchStart,
  onPinchEnd,
  onUpdate,
  onGestureEnd,
}) => {
  const containerRef = useAnimatedRef();

  const [internalGesturesEnabled, setGesturesEnabled] = useState<boolean>(true);
  const switchGestureStatus = (enabled: boolean) => {
    setGesturesEnabled(enabled);
  };

  const position = useVector(0, 0);
  const translate = useVector(0, 0);
  const origin = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const containerSize = useSizeVector(
    resizeConfig?.size.width ?? 0,
    resizeConfig?.size.height ?? 0
  );

  const childrenSize = useDerivedValue(() => {
    return resizeToAspectRatio({
      resizeConfig,
      width: containerSize.width.value,
      height: containerSize.height.value,
      scale: scale.value,
    });
  }, [resizeConfig, scale, containerSize]);

  useDerivedValue(() => {
    const { width, height } = childrenSize.value;

    onUpdate?.({
      x: position.x.value,
      y: position.y.value,
      width: containerSize.width.value,
      height: containerSize.height.value,
      resizedWidth: resizeConfig ? width : undefined,
      resizedHeight: resizeConfig ? height : undefined,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
    });
  }, [position, translate, scale, containerSize, childrenSize]);

  const pinch = Gesture.Pinch()
    .hitSlop(hitSlop)
    .enabled(gesturesEnabled && internalGesturesEnabled)
    .onStart((e) => {
      onPinchStart && runOnJS(onPinchStart)(e);

      const measuremet = measure(containerRef)!;
      containerSize.width.value = measuremet.width;
      containerSize.height.value = measuremet.height;
      position.x.value = measuremet.pageX;
      position.y.value = measuremet.pageY;

      origin.x.value = e.focalX - containerSize.width.value / 2;
      origin.y.value = e.focalY - containerSize.height.value / 2;
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
    .onEnd((e) => {
      runOnJS(switchGestureStatus)(false);
      onPinchEnd && runOnJS(onPinchEnd)(e);

      translate.x.value = withTiming(0, timingConfig);
      translate.y.value = withTiming(0, timingConfig);
      scale.value = withTiming(1, timingConfig, (_) => {
        runOnJS(switchGestureStatus)(true);
        onGestureEnd && runOnJS(onGestureEnd)();
      });
    });

  const tap = Gesture.Tap()
    .enabled(gesturesEnabled && internalGesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(1)
    .runOnJS(true)
    .onEnd((e) => onTap?.(e));

  const doubleTap = Gesture.Tap()
    .enabled(gesturesEnabled && internalGesturesEnabled)
    .numberOfTaps(2)
    .maxDuration(250)
    .runOnJS(true)
    .onEnd((e) => onDoubleTap?.(e));

  const containerStyle = useAnimatedStyle(() => {
    const width = containerSize.width.value;
    const height = containerSize.height.value;

    return {
      width: width === 0 ? undefined : width,
      height: height === 0 ? undefined : height,
    };
  }, [containerSize]);

  const childrenStyle = useAnimatedStyle(() => {
    const { width, height, deltaX, deltaY } = childrenSize.value;

    return {
      width: width === 0 ? undefined : width,
      height: height === 0 ? undefined : height,
      transform: [
        { translateX: translate.x.value - deltaX },
        { translateY: translate.y.value - deltaY },
        { scale: scale.value },
      ],
    };
  }, [resizeConfig, containerSize, childrenSize, translate, scale]);

  const composedTapGesture = Gesture.Exclusive(doubleTap, tap);

  return (
    <Animated.View style={[containerStyle, styles.center]}>
      <Animated.View ref={containerRef} style={childrenStyle}>
        {children}
      </Animated.View>

      <GestureDetector gesture={Gesture.Race(pinch, composedTapGesture)}>
        <Animated.View
          collapsable={false}
          pointerEvents={gesturesEnabled ? undefined : 'none'}
          style={styles.absolute}
        />
      </GestureDetector>
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
  },
});

export default withSnapbackValidation(SnapbackZoom);
