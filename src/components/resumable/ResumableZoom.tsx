import React, { useImperativeHandle } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { clamp } from '../../commons/utils/clamp';
import { useVector } from '../../commons/hooks/useVector';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { usePanCommons } from '../../commons/hooks/usePanCommons';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';
import { getPinchPanningStatus } from '../../commons/utils/getPinchPanningStatus';
import withResumableValidation from '../../commons/hoc/withResumableValidation';

import type {
  ResumableZoomProps,
  ResumableZoomType,
  ResumableZoomAssignableState,
} from './types';
import type { BoundsFuction, CommonZoomState } from '../../commons/types';
import { useDoubleTapCommons } from '../../commons/hooks/useDoubleTapCommons';

type ResumableReference = React.ForwardedRef<ResumableZoomType> | undefined;

const ResumableZoom: React.FC<ResumableZoomProps> = (props) => {
  const ref = (props as any).reference as ResumableReference;

  const {
    children,
    extendGestures = false,
    decay = true,
    tapsEnabled = true,
    panEnabled = true,
    pinchEnabled = true,
    minScale = 1,
    maxScale: userMaxScale = 6,
    panMode = 'clamp',
    scaleMode = 'bounce',
    pinchCenteringMode = 'clamp',
    allowPinchPanning: pinchPanning,
    onTap,
    onUpdate,
    onGestureEnd,
    onSwipe,
    onPinchStart: onUserPinchStart,
    onPinchEnd: onUserPinchEnd,
    onPanStart: onUserPanStart,
    onPanEnd: onUserPanEnd,
    onOverPanning,
  } = props;

  const allowPinchPanning = pinchPanning ?? getPinchPanningStatus();

  const rootSize = useSizeVector(1, 1);
  const childSize = useSizeVector(1, 1);
  const extendedSize = useSizeVector(1, 1);

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const scale = useSharedValue<number>(minScale);
  const scaleOffset = useSharedValue<number>(minScale);

  const maxScale = useDerivedValue(() => {
    if (typeof userMaxScale === 'object') {
      return getMaxScale(
        { width: childSize.width.value, height: childSize.height.value },
        userMaxScale
      );
    }

    return userMaxScale;
  }, [userMaxScale, childSize]);

  useDerivedValue(() => {
    extendedSize.width.value = extendGestures
      ? Math.max(rootSize.width.value, childSize.width.value)
      : childSize.width.value;

    extendedSize.height.value = extendGestures
      ? Math.max(rootSize.height.value, childSize.height.value)
      : childSize.height.value;
  }, [extendGestures, rootSize, childSize]);

  const boundsFn: BoundsFuction = (optionalScale) => {
    'worklet';
    const actualScale = optionalScale ?? scale.value;
    const { width: cWidth, height: cHeight } = childSize;
    const { width: rWidth, height: rHeight } = rootSize;

    const boundX = Math.max(0, cWidth.value * actualScale - rWidth.value) / 2;
    const boundY = Math.max(0, cHeight.value * actualScale - rHeight.value) / 2;
    return { x: boundX, y: boundY };
  };

  const set = (toX: number, toY: number, toScale: number, animate: boolean) => {
    'worklet';
    translate.x.value = animate ? withTiming(toX) : toX;
    translate.y.value = animate ? withTiming(toY) : toY;
    scale.value = animate ? withTiming(toScale) : toScale;
    scaleOffset.value = toScale;
  };

  useDerivedValue(() => {
    onUpdate?.({
      width: childSize.width.value,
      height: childSize.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
    });
  }, [childSize, translate, scale]);

  const {
    gesturesEnabled,
    onTouchesMove,
    onPinchStart,
    onPinchUpdate,
    onPinchEnd,
  } = usePinchCommons({
    container: extendedSize,
    translate,
    offset,
    scale,
    scaleOffset,
    minScale,
    maxScale,
    allowPinchPanning,
    scaleMode,
    pinchCenteringMode,
    boundFn: boundsFn,
    userCallbacks: {
      onGestureEnd,
      onPinchStart: onUserPinchStart,
      onPinchEnd: onUserPinchEnd,
    },
  });

  const { onPanStart, onPanChange, onPanEnd } = usePanCommons({
    container: extendedSize,
    translate,
    offset,
    panMode,
    boundFn: boundsFn,
    decay,
    userCallbacks: {
      onSwipe,
      onGestureEnd,
      onPanStart: onUserPanStart,
      onPanEnd: onUserPanEnd,
      onOverPanning,
    },
  });

  const { onDoubleTapEnd } = useDoubleTapCommons({
    container: rootSize,
    translate,
    scale,
    minScale,
    maxScale,
    scaleOffset,
    boundsFn: boundsFn,
    onGestureEnd,
  });

  const pinch = Gesture.Pinch()
    .enabled(pinchEnabled)
    .onTouchesMove(onTouchesMove)
    .onStart(onPinchStart)
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .enabled(panEnabled && gesturesEnabled)
    .maxPointers(1)
    .onStart(onPanStart)
    .onChange(onPanChange)
    .onEnd(onPanEnd);

  const tap = Gesture.Tap()
    .enabled(tapsEnabled && gesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(1)
    .runOnJS(true)
    .onEnd((e) => {
      const event = { ...e, x: e.x / scale.value, y: e.y / scale.value };
      onTap?.(event);
    });

  const doubleTap = Gesture.Tap()
    .enabled(tapsEnabled && gesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(2)
    .onEnd(onDoubleTapEnd);

  const measureRoot = (e: LayoutChangeEvent) => {
    rootSize.width.value = e.nativeEvent.layout.width;
    rootSize.height.value = e.nativeEvent.layout.height;
  };

  const measureChild = (e: LayoutChangeEvent) => {
    childSize.width.value = e.nativeEvent.layout.width;
    childSize.height.value = e.nativeEvent.layout.height;
  };

  const detectorStyle = useAnimatedStyle(() => {
    return {
      width: extendedSize.width.value * scaleOffset.value,
      height: extendedSize.height.value * scaleOffset.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
      ],
    };
  }, [extendedSize, scaleOffset, translate]);

  const childStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
    }),
    [scale]
  );

  const requestState = (): CommonZoomState<number> => {
    return {
      width: childSize.width.value,
      height: childSize.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
    };
  };

  const assignState = (state: ResumableZoomAssignableState, animate = true) => {
    const toScale = clamp(state.scale, minScale, maxScale.value);
    const { x: boundX, y: boundY } = boundsFn(toScale);
    const toX = clamp(state.translateX, -1 * boundX, boundX);
    const toY = clamp(state.translateY, -1 * boundY, boundY);

    set(toX, toY, toScale, animate);
  };

  useImperativeHandle(ref, () => ({
    reset: (animate = true) => set(0, 0, minScale, animate),
    requestState: requestState,
    assignState: assignState,
  }));

  const composedTap = Gesture.Exclusive(doubleTap, tap);
  const composedGesture = Gesture.Race(pinch, pan, composedTap);

  return (
    <GestureHandlerRootView style={styles.root} onLayout={measureRoot}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[detectorStyle, styles.center]}>
          <Animated.View style={childStyle} onLayout={measureChild}>
            {children}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withResumableValidation<ResumableZoomType, ResumableZoomProps>(
  ResumableZoom
);
