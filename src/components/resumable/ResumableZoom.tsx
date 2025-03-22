import React, { useImperativeHandle } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
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
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';
import { useDoubleTapCommons } from '../../commons/hooks/useDoubleTapCommons';
import withResumableValidation from '../../commons/hoc/withResumableValidation';
import { getVisibleRect as getRect } from '../../commons/utils/getVisibleRect';

import type {
  BoundsFuction,
  CommonZoomState,
  Rect,
  Vector,
} from '../../commons/types';
import type {
  ResumableZoomProps,
  ResumableZoomType,
  ResumableZoomAssignableState,
} from './types';

type ResumableZoomPropsWithRef = ResumableZoomProps & {
  reference?: React.ForwardedRef<ResumableZoomType>;
};

const ResumableZoom: React.FC<ResumableZoomPropsWithRef> = (props) => {
  const {
    reference,
    children,
    style,
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
    allowPinchPanning = true,
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
    onTouchesDown,
    onTouchesMove,
    onTouchesUp,
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
    container: extendedSize,
    translate,
    scale,
    minScale,
    maxScale,
    scaleOffset,
    boundsFn: boundsFn,
    onGestureEnd,
  });

  const pinch = Gesture.Pinch()
    .withTestId('pinch')
    .enabled(pinchEnabled)
    .manualActivation(true)
    .onTouchesDown(onTouchesDown)
    .onTouchesMove(onTouchesMove)
    .onTouchesUp(onTouchesUp)
    .onStart(onPinchStart)
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .withTestId('pan')
    .enabled(panEnabled && gesturesEnabled)
    .maxPointers(1)
    .onStart(onPanStart)
    .onChange(onPanChange)
    .onEnd(onPanEnd);

  const tap = Gesture.Tap()
    .withTestId('tap')
    .enabled(tapsEnabled && gesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(1)
    .runOnJS(true)
    .onEnd((e) => onTap?.(e));

  const doubleTap = Gesture.Tap()
    .withTestId('doubleTap')
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
      width: extendedSize.width.value,
      height: extendedSize.height.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { scale: scale.value },
      ],
    };
  }, [extendedSize, translate, scale]);

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

  const getVisibleRect = (): Rect => {
    return getRect({
      scale: scale.value,
      itemSize: {
        width: childSize.width.value,
        height: childSize.height.value,
      },
      containerSize: {
        width: rootSize.width.value,
        height: rootSize.height.value,
      },
      translation: { x: translate.x.value, y: translate.y.value },
    });
  };

  const zoom = (multiplier: number, xy?: Vector<number>) => {
    const toScale = clamp(scale.value * multiplier, minScale, maxScale.value);

    let focal = xy;
    if (focal !== undefined) {
      focal = {
        x: clamp(focal.x, 0, childSize.width.value),
        y: clamp(focal.y, 0, childSize.height.value),
      };
    } else {
      const frame = getVisibleRect();
      focal = {
        x: frame.x + frame.width / 2,
        y: frame.y + frame.height / 2,
      };
    }

    const centerX = childSize.width.value / 2;
    const centerY = childSize.height.value / 2;

    const originX = focal.x - centerX;
    const originY = focal.y - centerY;
    const signedDistanceCenterX = centerX - focal.x;
    const signedDistanceCenterY = centerY - focal.y;

    const translateX = signedDistanceCenterX + (originX - originX * toScale);
    const translateY = signedDistanceCenterY + (originY - originY * toScale);

    const { x: boundX, y: boundY } = boundsFn(toScale);
    const toX = clamp(translateX, -1 * boundX, boundX);
    const toY = clamp(translateY, -1 * boundY, boundY);

    set(toX, toY, toScale, true);
  };

  useImperativeHandle(reference, () => ({
    reset: (animate = true) => set(0, 0, minScale, animate),
    requestState: requestState,
    assignState: assignState,
    zoom: zoom,
    getVisibleRect: getVisibleRect,
  }));

  const composedTap = Gesture.Exclusive(doubleTap, tap);
  const composedGesture = Gesture.Race(pinch, pan, composedTap);

  return (
    <View style={[style ?? styles.flex, styles.center]} onLayout={measureRoot}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View testID={'root'} style={[detectorStyle, styles.center]}>
          <Animated.View testID={'child'} onLayout={measureChild}>
            {children}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withResumableValidation<ResumableZoomType, ResumableZoomProps>(
  ResumableZoom
);
