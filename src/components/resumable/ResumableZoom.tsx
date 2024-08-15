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
import { pinchTransform } from '../../commons/utils/pinchTransform';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';
import {
  PanMode,
  PinchCenteringMode,
  ScaleMode,
  type BoundsFuction,
} from '../../commons/types';
import withResumableValidation from '../../commons/hoc/withResumableValidation';

import type {
  ResumableZoomState,
  ResumableZoomProps,
  ResumableZoomType,
  ResumableZoomAssignableState,
} from './types';
import { getPinchPanningStatus } from '../../commons/utils/getPinchPanningStatus';

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
    panMode = PanMode.CLAMP,
    scaleMode = ScaleMode.BOUNCE,
    pinchCenteringMode = PinchCenteringMode.CLAMP,
    allowPinchPanning: pinchPanning,
    onTap,
    onGestureActive,
    onGestureEnd,
    onSwipe,
    onPinchStart: onUserPinchStart,
    onPinchEnd: onUserPinchEnd,
    onPanStart: onUserPanStart,
    onPanEnd: onUserPanEnd,
    onOverPanning,
  } = props;

  const allowPinchPanning = pinchPanning ?? getPinchPanningStatus();

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const scale = useSharedValue<number>(minScale);
  const scaleOffset = useSharedValue<number>(minScale);

  const origin = useVector(0, 0);
  const delta = useVector(0, 0);

  const rootSize = useSizeVector(0, 0);
  const childSize = useSizeVector(0, 0);
  const extendedSize = useSizeVector(0, 0);

  const detectorTranslate = useVector(0, 0);
  const detectorScale = useSharedValue(minScale);

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

  const boundsFn: BoundsFuction = (scaleValue) => {
    'worklet';
    const { width: cWidth, height: cHeight } = childSize;
    const { width: rWidth, height: rHeight } = rootSize;

    const boundX = Math.max(0, cWidth.value * scaleValue - rWidth.value) / 2;
    const boundY = Math.max(0, cHeight.value * scaleValue - rHeight.value) / 2;
    return { x: boundX, y: boundY };
  };

  const reset = (
    toX: number,
    toY: number,
    toScale: number,
    animate: boolean = true
  ) => {
    'worklet';
    detectorTranslate.x.value = translate.x.value;
    detectorTranslate.y.value = translate.y.value;
    detectorScale.value = scale.value;

    translate.x.value = animate ? withTiming(toX) : toX;
    translate.y.value = animate ? withTiming(toY) : toY;
    scale.value = animate ? withTiming(toScale) : toScale;
    detectorTranslate.x.value = animate ? withTiming(toX) : toX;
    detectorTranslate.y.value = animate ? withTiming(toY) : toY;
    detectorScale.value = animate ? withTiming(toScale) : toScale;
  };

  useDerivedValue(() => {
    onGestureActive?.({
      width: childSize.width.value,
      height: childSize.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
    });
  }, [translate, childSize, scale]);

  const { gesturesEnabled, onPinchStart, onPinchUpdate, onPinchEnd } =
    usePinchCommons({
      container: extendGestures ? extendedSize : childSize,
      detectorTranslate,
      detectorScale,
      translate,
      offset,
      origin,
      scale,
      scaleOffset,
      minScale,
      maxScale,
      delta,
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
    container: extendGestures ? extendedSize : childSize,
    detectorTranslate,
    translate,
    offset,
    scale,
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

  const pinch = Gesture.Pinch()
    .enabled(pinchEnabled)
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
    .onEnd((e) => onTap?.(e));

  const doubleTap = Gesture.Tap()
    .enabled(tapsEnabled && gesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(2)
    .onEnd((e) => {
      const originX = e.x - extendedSize.width.value / 2;
      const originY = e.y - extendedSize.height.value / 2;
      const toScale =
        scale.value >= maxScale.value * 0.8 ? minScale : maxScale.value;

      const { x, y } = pinchTransform({
        toScale: toScale,
        fromScale: scale.value,
        origin: { x: originX, y: originY },
        delta: { x: 0, y: 0 },
        offset: { x: translate.x.value, y: translate.y.value },
      });

      const { x: boundX, y: boundY } = boundsFn(toScale);
      const toX = clamp(x, -1 * boundX, boundX);
      const toY = clamp(y, -1 * boundY, boundY);

      reset(toX, toY, toScale, true);
    });

  const measureRoot = (e: LayoutChangeEvent) => {
    rootSize.width.value = e.nativeEvent.layout.width;
    rootSize.height.value = e.nativeEvent.layout.height;
  };

  const measureChild = (e: LayoutChangeEvent) => {
    childSize.width.value = e.nativeEvent.layout.width;
    childSize.height.value = e.nativeEvent.layout.height;
  };

  const childStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { scale: scale.value },
      ],
    }),
    [translate, scale]
  );

  const detectorStyle = useAnimatedStyle(() => {
    return {
      width: extendedSize.width.value,
      height: extendedSize.height.value,
      position: 'absolute',
      transform: [
        { translateX: detectorTranslate.x.value },
        { translateY: detectorTranslate.y.value },
        { scale: detectorScale.value },
      ],
    };
  }, [childSize, rootSize, detectorTranslate, detectorScale]);

  const requestState = (): ResumableZoomState => {
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

    reset(toX, toY, toScale, animate);
  };

  useImperativeHandle(ref, () => ({
    reset: (animate) => reset(0, 0, minScale, animate),
    requestState: requestState,
    assignState: assignState,
  }));

  const composedTap = Gesture.Exclusive(doubleTap, tap);
  const composedGesture = Gesture.Race(pinch, pan, composedTap);

  return (
    <GestureHandlerRootView style={styles.root} onLayout={measureRoot}>
      <Animated.View style={childStyle} onLayout={measureChild}>
        {children}
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View style={detectorStyle} />
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
});

export default withResumableValidation<ResumableZoomType, ResumableZoomProps>(
  ResumableZoom
);
