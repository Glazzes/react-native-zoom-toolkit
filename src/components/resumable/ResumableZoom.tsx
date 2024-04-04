import React, { useImperativeHandle } from 'react';
import {
  Platform,
  View,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { clamp } from '../../commons/utils/clamp';
import { useVector } from '../../commons/hooks/useVector';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { usePanCommons } from '../../commons/hooks/usePanCommons';
import { pinchTransform } from '../../commons/utils/pinchTransform';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';
import { PanMode, ScaleMode, type BoundsFuction } from '../../commons/types';
import withResumableValidation from '../../commons/hoc/withResumableValidation';

import { DEFAULT_HITSLOP } from '../../commons/constants';
import type {
  ResumableZoomState,
  ResumableZoomProps,
  ResumableZoomType,
} from './types';

type ResumableReference = React.ForwardedRef<ResumableZoomType> | undefined;

const ResumableZoom: React.FC<ResumableZoomProps> = (props) => {
  const ref = (props as any).reference as ResumableReference;

  const {
    children,
    hitSlop = DEFAULT_HITSLOP,
    decay = true,
    tapsEnabled = true,
    panEnabled = true,
    pinchEnabled = true,
    minScale = 1,
    maxScale: userMaxScale = 6,
    panMode = PanMode.CLAMP,
    scaleMode = ScaleMode.BOUNCE,
    panWithPinch = Platform.OS !== 'ios',
    onTap,
    onGestureActive,
    onSwipeRight,
    onSwipeLeft,
    onPinchStart: onUserPinchStart,
    onPinchEnd: onUserPinchEnd,
    onPanStart: onUserPanStart,
    onPanEnd: onUserPanEnd,
    onHorizontalBoundsExceeded,
  } = props;

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const scale = useSharedValue<number>(minScale);
  const scaleOffset = useSharedValue<number>(minScale);

  const origin = useVector(0, 0);
  const delta = useVector(0, 0);

  const rootContainer = useSizeVector(0, 0);
  const detector = useSizeVector(0, 0);
  const detectorTranslate = useVector(0, 0);
  const detectorScale = useSharedValue(minScale);

  const maxScale = useDerivedValue(() => {
    if (typeof userMaxScale === 'object') {
      return getMaxScale(
        { width: detector.width.value, height: detector.height.value },
        userMaxScale
      );
    }

    return userMaxScale;
  }, [userMaxScale, detector]);

  const boundsFn: BoundsFuction = (scaleValue) => {
    'worklet';
    const { width: dWidth, height: dHeight } = detector;
    const { width: rWidth, height: rHeight } = rootContainer;

    const boundX = Math.max(0, dWidth.value * scaleValue - rWidth.value) / 2;
    const boundY = Math.max(0, dHeight.value * scaleValue - rHeight.value) / 2;
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
      width: detector.width.value,
      height: detector.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
    });
  }, [translate, detector, scale]);

  const { gesturesEnabled, onPinchStart, onPinchUpdate, onPinchEnd } =
    usePinchCommons({
      detector,
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
      panWithPinch,
      scaleMode,
      panMode,
      boundFn: boundsFn,
      userCallbacks: {
        onPinchStart: onUserPinchStart,
        onPinchEnd: onUserPinchEnd,
      },
    });

  const { onPanStart, onPanChange, onPanEnd } = usePanCommons({
    detector,
    detectorTranslate,
    translate,
    offset,
    scale,
    minScale,
    maxScale,
    panMode,
    boundFn: boundsFn,
    decay,
    userCallbacks: {
      onSwipeRight,
      onSwipeLeft,
      onPanStart: onUserPanStart,
      onPanEnd: onUserPanEnd,
      onHorizontalBoundsExceeded,
    },
  });

  const pinch = Gesture.Pinch()
    .enabled(pinchEnabled)
    .hitSlop(hitSlop)
    .onStart(onPinchStart)
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .enabled(panEnabled && gesturesEnabled)
    .hitSlop(hitSlop)
    .maxPointers(1)
    .onStart(onPanStart)
    .onChange(onPanChange)
    .onEnd(onPanEnd);

  const tap = Gesture.Tap()
    .enabled(tapsEnabled && gesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(1)
    .hitSlop(hitSlop)
    .runOnJS(true)
    .onEnd((e) => onTap?.(e));

  const doubleTap = Gesture.Tap()
    .enabled(tapsEnabled && gesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(2)
    .hitSlop(hitSlop)
    .onEnd((e) => {
      if (scale.value >= maxScale.value * 0.8) {
        reset(0, 0, minScale, true);
        return;
      }

      const originX = e.x - detector.width.value / 2;
      const originY = e.y - detector.height.value / 2;

      const { x, y } = pinchTransform({
        toScale: maxScale.value,
        fromScale: scale.value,
        origin: { x: originX, y: originY },
        delta: { x: 0, y: 0 },
        offset: { x: translate.x.value, y: translate.y.value },
      });

      const { x: boundX, y: boundY } = boundsFn(maxScale.value);
      const toX = clamp(x, -1 * boundX, boundX);
      const toY = clamp(y, -1 * boundY, boundY);

      reset(toX, toY, maxScale.value, true);
    });

  const measureRoot = (e: LayoutChangeEvent) => {
    rootContainer.width.value = e.nativeEvent.layout.width;
    rootContainer.height.value = e.nativeEvent.layout.height;
  };

  const measureContainer = (e: LayoutChangeEvent) => {
    detector.width.value = e.nativeEvent.layout.width;
    detector.height.value = e.nativeEvent.layout.height;
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

  const detectorStyle = useAnimatedStyle(
    () => ({
      width: detector.width.value,
      height: detector.height.value,
      position: 'absolute',
      transform: [
        { translateX: detectorTranslate.x.value },
        { translateY: detectorTranslate.y.value },
        { scale: detectorScale.value },
      ],
    }),
    [detector, detectorTranslate, detectorScale]
  );

  const requestState = (): ResumableZoomState => {
    return {
      width: detector.width.value,
      height: detector.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
    };
  };

  useImperativeHandle(ref, () => ({
    reset: (animate) => reset(0, 0, 1, animate),
    requestState: requestState,
  }));

  const composedTap = Gesture.Exclusive(doubleTap, tap);
  const composedGesture = Gesture.Race(pinch, pan, composedTap);

  return (
    <View style={styles.root} onLayout={measureRoot}>
      <Animated.View style={childStyle} onLayout={measureContainer}>
        {children}
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View style={detectorStyle} />
      </GestureDetector>
    </View>
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
