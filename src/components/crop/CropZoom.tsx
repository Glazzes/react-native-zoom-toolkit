import React, { useImperativeHandle } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import Animated, {
  clamp,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { crop } from '../../commons/utils/crop';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { getCropRotatedSize } from '../../commons/utils/getCropRotatedSize';
import { usePanCommons } from '../../commons/hooks/usePanCommons';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { useVector } from '../../commons/hooks/useVector';

import type { BoundsFuction } from '../../commons/types';

import type {
  CropZoomProps,
  CropContextResult,
  CropZoomType,
  FlipCallback,
  CropZoomState,
  CropAssignableState,
  RotationCallback,
} from './types';
import withCropValidation from '../../commons/hoc/withCropValidation';

const TAU = Math.PI * 2;
const RAD2DEG = 180 / Math.PI;

type CropZoomPropsWithRef = CropZoomProps & {
  reference?: React.ForwardedRef<CropZoomType>;
};

const CropZoom: React.FC<CropZoomPropsWithRef> = (props) => {
  const {
    reference,
    children,
    cropSize,
    resolution,
    minScale = 1,
    maxScale: userMaxScale,
    scaleMode = 'bounce',
    panMode = 'free',
    allowPinchPanning = true,
    onUpdate,
    onGestureEnd,
    OverlayComponent,
    onPanStart: onUserPanStart,
    onPanEnd: onUserPanEnd,
    onPinchStart: onUserPinchStart,
    onPinchEnd: onUserPinchEnd,
    onTap,
  } = props;

  const initialSize = getCropRotatedSize({
    crop: cropSize,
    resolution: resolution,
    angle: 0,
  });

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const scale = useSharedValue<number>(minScale);
  const scaleOffset = useSharedValue<number>(minScale);
  const rotation = useSharedValue<number>(0);
  const rotate = useVector(0, 0);

  const rootSize = useSizeVector(0, 0);
  const childSize = useSizeVector(initialSize.width, initialSize.height);
  const gestureSize = useSizeVector(initialSize.width, initialSize.height);
  const sizeAngle = useSharedValue<number>(0);

  const maxScale = useDerivedValue(() => {
    const scaleValue = getMaxScale(
      { width: childSize.width.value, height: childSize.height.value },
      resolution
    );

    return userMaxScale ?? scaleValue;
  }, [childSize, userMaxScale, resolution]);

  useDerivedValue(() => {
    const size = getCropRotatedSize({
      crop: cropSize,
      resolution,
      angle: sizeAngle.value,
    });

    let finalSize = 0;
    const max = Math.max(rootSize.width.value, rootSize.height.value);
    if (childSize.width.value > childSize.height.value) {
      const sizeOffset = initialSize.width - cropSize.width;
      finalSize = max + sizeOffset;
    } else {
      const sizeOffset = initialSize.height - cropSize.height;
      finalSize = max + sizeOffset;
    }

    gestureSize.width.value = finalSize;
    gestureSize.height.value = finalSize;
    childSize.width.value = withTiming(size.width);
    childSize.height.value = withTiming(size.height);
  }, [rootSize, cropSize, resolution, childSize, sizeAngle]);

  useDerivedValue(() => {
    onUpdate?.({
      width: childSize.width.value,
      height: childSize.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
      rotate: rotation.value,
      rotateX: rotate.x.value,
      rotateY: rotate.y.value,
    });
  }, [childSize, translate, scale, rotation, rotate]);

  const boundsFn: BoundsFuction = (optionalScale) => {
    'worklet';
    const scaleVal = optionalScale ?? scale.value;
    let size = { width: childSize.width.value, height: childSize.height.value };

    const isInInverseAspectRatio = rotation.value % Math.PI !== 0;
    if (isInInverseAspectRatio) {
      size = { width: size.height, height: size.width };
    }

    const boundX = Math.max(0, size.width * scaleVal - cropSize.width) / 2;
    const boundY = Math.max(0, size.height * scaleVal - cropSize.height) / 2;
    return { x: boundX, y: boundY };
  };

  function measureRootContainer(e: LayoutChangeEvent) {
    rootSize.width.value = e.nativeEvent.layout.width;
    rootSize.height.value = e.nativeEvent.layout.height;
  }

  const {
    gesturesEnabled,
    onTouchesDown,
    onTouchesMove,
    onTouchesUp,
    onPinchStart,
    onPinchUpdate,
    onPinchEnd,
  } = usePinchCommons({
    container: gestureSize,
    translate,
    offset,
    scale,
    scaleOffset,
    minScale,
    maxScale,
    allowPinchPanning,
    scaleMode,
    pinchCenteringMode: 'sync',
    boundFn: boundsFn,
    userCallbacks: {
      onGestureEnd: onGestureEnd,
      onPinchStart: onUserPinchStart,
      onPinchEnd: onUserPinchEnd,
    },
  });

  const { onPanStart, onPanChange, onPanEnd } = usePanCommons({
    container: gestureSize,
    translate,
    offset,
    panMode,
    boundFn: boundsFn,
    userCallbacks: {
      onGestureEnd: onGestureEnd,
      onPanStart: onUserPanStart,
      onPanEnd: onUserPanEnd,
    },
  });

  const pinch = Gesture.Pinch()
    .withTestId('pinch')
    .manualActivation(true)
    .onTouchesDown(onTouchesDown)
    .onTouchesMove(onTouchesMove)
    .onTouchesUp(onTouchesUp)
    .onStart(onPinchStart)
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .withTestId('pan')
    .enabled(gesturesEnabled)
    .maxPointers(1)
    .onStart(onPanStart)
    .onChange(onPanChange)
    .onEnd(onPanEnd);

  const tap = Gesture.Tap()
    .withTestId('tap')
    .enabled(gesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(1)
    .runOnJS(true)
    .onEnd((e) => onTap?.(e));

  const detectorStyle = useAnimatedStyle(() => {
    return {
      width: gestureSize.width.value,
      height: gestureSize.height.value,
      position: 'absolute',
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { scale: scale.value },
      ],
    };
  }, [gestureSize, translate, scale]);

  const childStyle = useAnimatedStyle(() => {
    return {
      width: childSize.width.value,
      height: childSize.height.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
        { rotateX: `${rotate.x.value}rad` },
        { rotateY: `${rotate.y.value}rad` },
      ],
    };
  }, [childSize, translate, scale, rotation, rotate]);

  // Reference handling section
  const resetTo = (st: CropAssignableState, animate: boolean = true) => {
    translate.x.value = animate ? withTiming(st.translateX) : st.translateX;
    translate.y.value = animate ? withTiming(st.translateY) : st.translateY;
    scale.value = animate ? withTiming(st.scale) : st.scale;
    scaleOffset.value = st.scale;

    rotate.x.value = animate ? withTiming(st.rotateX) : st.rotateX;
    rotate.y.value = animate ? withTiming(st.rotateY) : st.rotateY;
    rotation.value = animate
      ? withTiming(st.rotate, undefined, () => {
          canRotate.value = true;
          rotation.value = rotation.value % TAU;
        })
      : st.rotate % TAU;
  };

  const canRotate = useSharedValue<boolean>(true);
  const handleRotate: RotationCallback = (
    animate = true,
    clockwise = true,
    cb
  ) => {
    if (!canRotate.value) return;
    if (animate) canRotate.value = false;

    // Determine the direction multiplier based on clockwise or counterclockwise rotation
    const direction = clockwise ? 1 : -1;
    const toAngle = rotation.value + direction * (Math.PI / 2);
    sizeAngle.value = toAngle;
    cb?.(toAngle % TAU);

    resetTo(
      {
        translateX: 0,
        translateY: 0,
        scale: minScale,
        rotate: toAngle,
        rotateX: rotate.x.value,
        rotateY: rotate.y.value,
      },
      animate
    );
  };

  const flipHorizontal: FlipCallback = (animate = true, cb) => {
    const toAngle = rotate.y.value !== Math.PI ? Math.PI : 0;
    cb?.(toAngle * RAD2DEG);
    rotate.y.value = animate ? withTiming(toAngle) : toAngle;
  };

  const flipVertical: FlipCallback = (animate = true, cb) => {
    const toAngle = rotate.x.value !== Math.PI ? Math.PI : 0;
    cb?.(toAngle * RAD2DEG);
    rotate.x.value = animate ? withTiming(toAngle) : toAngle;
  };

  const handleCrop = (fixedWidth?: number): CropContextResult => {
    const context: CropContextResult['context'] = {
      rotationAngle: rotation.value * RAD2DEG,
      flipHorizontal: rotate.y.value === Math.PI,
      flipVertical: rotate.x.value === Math.PI,
    };

    const result = crop({
      scale: scale.value,
      cropSize: cropSize,
      resolution: resolution,
      itemSize: {
        width: childSize.width.value,
        height: childSize.height.value,
      },
      translation: { x: translate.x.value, y: translate.y.value },
      isRotated: context.rotationAngle % 180 !== 0,
      fixedWidth,
    });

    return {
      crop: result.crop,
      resize: result.resize,
      context,
    };
  };

  const handleRequestState = (): CropZoomState<number> => ({
    width: childSize.width.value,
    height: childSize.height.value,
    translateX: translate.x.value,
    translateY: translate.y.value,
    scale: scale.value,
    rotate: rotation.value,
    rotateX: rotate.x.value,
    rotateY: rotate.y.value,
  });

  const assignState = (state: CropAssignableState, animate: boolean = true) => {
    const toScale = clamp(state.scale, minScale, maxScale.value);

    const { x: boundX, y: boundY } = boundsFn(toScale);
    const translateX = clamp(state.translateX, -1 * boundX, boundX);
    const translateY = clamp(state.translateY, -1 * boundY, boundY);

    const DEG90 = Math.PI / 2;
    const toRotate = Math.floor((state.rotate % (Math.PI * 2)) / DEG90) * DEG90;
    const rotateX = Math.sign(state.rotateX - DEG90) === 1 ? Math.PI : 0;
    const rotateY = Math.sign(state.rotateY - DEG90) === 1 ? Math.PI : 0;

    resetTo(
      {
        translateX,
        translateY,
        scale: toScale,
        rotate: toRotate,
        rotateX,
        rotateY,
      },
      animate
    );
  };

  useImperativeHandle(reference, () => ({
    rotate: handleRotate,
    flipHorizontal: flipHorizontal,
    flipVertical: flipVertical,
    reset: (animate) =>
      resetTo(
        {
          translateX: 0,
          translateY: 0,
          scale: minScale,
          rotate: 0,
          rotateX: 0,
          rotateY: 0,
        },
        animate
      ),
    crop: handleCrop,
    requestState: handleRequestState,
    assignState: assignState,
  }));

  const rootStyle: ViewStyle = {
    minWidth: cropSize.width,
    minHeight: cropSize.height,
  };

  return (
    <View
      style={[styles.root, rootStyle, styles.center]}
      onLayout={measureRootContainer}
    >
      <Animated.View style={childStyle}>{children}</Animated.View>
      <View style={styles.absolute} pointerEvents={'none'}>
        {OverlayComponent?.()}
      </View>

      <GestureDetector gesture={Gesture.Race(pinch, pan, tap)}>
        <Animated.View style={detectorStyle} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  absolute: {
    position: 'absolute',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withCropValidation<CropZoomType, CropZoomProps>(CropZoom);
