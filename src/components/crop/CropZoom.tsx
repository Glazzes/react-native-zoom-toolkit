import React, { useImperativeHandle } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  clamp,
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
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { getCropRotatedSize } from '../../commons/utils/getCropRotatedSize';
import { usePanCommons } from '../../commons/hooks/usePanCommons';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { useVector } from '../../commons/hooks/useVector';
import { PanMode, type BoundsFuction, ScaleMode } from '../../commons/types';
import { crop } from '../../commons/utils/crop';
import {
  CropMode,
  type CropZoomProps,
  type CropContextResult,
  type CropZoomType,
  type RotateTransitionCallback,
  type DirectionRotationCallback,
  type CropZoomState,
  type CropZoomAssignableState,
} from './types';
import withCropValidation from '../../commons/hoc/withCropValidation';
import { RAD2DEG } from '../../commons/constants';
import { getPanWithPinchStatus } from '../../commons/utils/getPanWithPinchStatus';

const detectorColor = 'rgba(50, 168, 82, 0.5)';
const containerColor = 'rgba(238, 66, 102, 0.5)';

type Reference = React.ForwardedRef<CropZoomType> | undefined;

const CropZoom: React.FC<CropZoomProps> = (props) => {
  const ref = (props as any).reference as Reference;

  const {
    children,
    cropSize,
    resolution,
    debug = false,
    minScale = 1,
    maxScale: userMaxScale,
    scaleMode = ScaleMode.BOUNCE,
    panMode = PanMode.FREE,
    allowPinchPanning: pinchPanning,
    mode = CropMode.MANAGED,
    onGestureActive,
    onGestureEnd,
    OverlayComponent,
    onPanStart: onUserPanStart,
    onPanEnd: onUserPanEnd,
    onPinchStart: onUserPinchStart,
    onPinchEnd: onUserPinchEnd,
    onTap,
  } = props;

  const allowPinchPanning = pinchPanning ?? getPanWithPinchStatus();

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const origin = useVector(0, 0);

  const rotation = useSharedValue<number>(0);
  const rotate = useVector(0, 0);

  const delta = useVector(0, 0);
  const scale = useSharedValue<number>(minScale);
  const scaleOffset = useSharedValue<number>(minScale);

  const container = useSizeVector(1, 1);
  const detector = useSizeVector(1, 1);
  const sizeAngle = useSharedValue<number>(0);

  const detectorTranslate = useVector(0, 0);
  const detectorScale = useSharedValue<number>(1);

  const maxScale = useDerivedValue(() => {
    const { width, height } = container;
    const scaleValue = getMaxScale(
      { width: width.value, height: height.value },
      resolution
    );

    return userMaxScale ?? scaleValue;
  }, [container, userMaxScale, resolution]);

  useDerivedValue(() => {
    const size = getCropRotatedSize({
      crop: cropSize,
      resolution: resolution,
      angle: sizeAngle.value,
    });

    const isFlipped = rotation.value % Math.PI !== 0;
    const render1 = container.width.value === 1 && container.height.value === 1;

    container.width.value = render1 ? size.width : withTiming(size.width);
    container.height.value = render1 ? size.height : withTiming(size.height);

    detector.width.value = isFlipped ? size.height : size.width;
    detector.height.value = isFlipped ? size.width : size.height;
  }, [cropSize, resolution, sizeAngle, rotation, container, detector]);

  useDerivedValue(() => {
    onGestureActive?.({
      width: container.width.value,
      height: container.height.value,
      translateX: translate.x.value,
      translateY: translate.y.value,
      scale: scale.value,
      rotate: rotation.value,
      rotateX: rotate.x.value,
      rotateY: rotate.y.value,
    });
  }, [container, translate, scale, rotate, rotation]);

  const boundsFn: BoundsFuction = (scaleValue: number) => {
    'worklet';
    let size = { width: container.width.value, height: container.height.value };

    const isInInverseAspectRatio = rotation.value % Math.PI !== 0;
    if (isInInverseAspectRatio) {
      size = { width: size.height, height: size.width };
    }

    const boundX = Math.max(0, size.width * scaleValue - cropSize.width) / 2;
    const boundY = Math.max(0, size.height * scaleValue - cropSize.height) / 2;
    return { x: boundX, y: boundY };
  };

  const { gesturesEnabled, onPinchStart, onPinchUpdate, onPinchEnd } =
    usePinchCommons({
      container: detector,
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
      panMode,
      boundFn: boundsFn,
      userCallbacks: {
        onGestureEnd: onGestureEnd,
        onPinchStart: onUserPinchStart,
        onPinchEnd: onUserPinchEnd,
      },
    });

  const { onPanStart, onPanChange, onPanEnd } = usePanCommons({
    translate,
    offset,
    scale,
    minScale,
    maxScale,
    detector,
    detectorTranslate,
    panMode,
    boundFn: boundsFn,
    userCallbacks: {
      onGestureEnd: onGestureEnd,
      onPanStart: onUserPanStart,
      onPanEnd: onUserPanEnd,
    },
  });

  const pinch = Gesture.Pinch()
    .onStart(onPinchStart)
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .enabled(gesturesEnabled)
    .maxPointers(1)
    .onStart(onPanStart)
    .onChange(onPanChange)
    .onEnd(onPanEnd);

  const tap = Gesture.Tap()
    .enabled(gesturesEnabled)
    .maxDuration(250)
    .numberOfTaps(1)
    .runOnJS(true)
    .onEnd((e) => onTap?.(e));

  const detectorStyle = useAnimatedStyle(() => {
    return {
      width: detector.width.value,
      height: detector.height.value,
      position: 'absolute',
      backgroundColor: debug ? detectorColor : undefined,
      transform: [
        { translateX: detectorTranslate.x.value },
        { translateY: detectorTranslate.y.value },
        { scale: detectorScale.value },
      ],
    };
  }, [detector, debug, detectorTranslate, detectorScale]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      width: container.width.value,
      height: container.height.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
        { rotateX: `${rotate.x.value}rad` },
        { rotateY: `${rotate.y.value}rad` },
      ],
    };
  }, [container, translate, scale, rotation, rotate]);

  // Reference handling section
  const canRotate = useSharedValue<boolean>(true);
  const handleRotate: DirectionRotationCallback = (
    animate = true,
    clockwise = true,
    cb
  ) => {
    if (!canRotate.value) return;

    // Determine the direction multiplier based on clockwise or counterclockwise rotation
    const direction = clockwise ? 1 : -1;
    const toAngle = rotation.value + (Math.PI / 2) * direction;
    sizeAngle.value = toAngle;
    if (cb !== undefined) cb(toAngle % (Math.PI * 2));

    if (animate) {
      canRotate.value = false;

      translate.x.value = withTiming(0);
      translate.y.value = withTiming(0);
      detectorTranslate.x.value = withTiming(0);
      detectorTranslate.y.value = withTiming(0);
      scale.value = withTiming(1);
      detectorScale.value = withTiming(1);

      rotation.value = withTiming(toAngle, undefined, (_) => {
        canRotate.value = true;
        if (Math.abs(rotation.value) === Math.PI * 2) rotation.value = 0;
      });

      return;
    }

    translate.x.value = 0;
    translate.y.value = 0;
    detectorTranslate.x.value = 0;
    detectorTranslate.y.value = 0;
    scale.value = 1;
    detectorScale.value = 1;
  };

  const flipHorizontal: RotateTransitionCallback = (animate = true, cb) => {
    const toAngle = rotate.y.value !== Math.PI ? Math.PI : 0;
    if (cb !== undefined) cb(toAngle * RAD2DEG);

    if (animate) {
      rotate.y.value = withTiming(toAngle);
      return;
    }

    rotate.y.value = toAngle;
  };

  const flipVertical: RotateTransitionCallback = (animate = true, cb) => {
    const toAngle = rotate.x.value !== Math.PI ? Math.PI : 0;
    if (cb !== undefined) cb(toAngle * RAD2DEG);

    if (animate) {
      rotate.x.value = withTiming(toAngle);
      return;
    }

    rotate.x.value = toAngle;
  };

  const handleReset = (animate: boolean = true) => {
    if (animate) {
      translate.x.value = withTiming(0);
      translate.y.value = withTiming(0);
      rotation.value = withTiming(0);
      rotate.x.value = withTiming(0);
      rotate.y.value = withTiming(0);
      scale.value = withTiming(minScale);
      return;
    }

    translate.x.value = 0;
    translate.y.value = 0;
    rotation.value = 0;
    rotate.x.value = 0;
    rotate.y.value = 0;
    scale.value = minScale;
  };

  const handleCrop = (fixedWidth?: number): CropContextResult => {
    return crop({
      cropSize: cropSize,
      resolution: resolution,
      canvas: { width: container.width.value, height: container.height.value },
      position: { x: translate.x.value, y: translate.y.value },
      scale: scale.value,
      context: {
        rotationAngle: rotation.value * RAD2DEG,
        flipHorizontal: rotate.y.value === Math.PI,
        flipVertical: rotate.x.value === Math.PI,
      },
      fixedWidth,
    });
  };

  const handleRequestState = (): CropZoomState => ({
    width: container.width.value,
    height: container.height.value,
    translateX: translate.x.value,
    translateY: translate.y.value,
    scale: scale.value,
    rotate: rotation.value,
    rotateX: rotate.x.value,
    rotateY: rotate.y.value,
  });

  const handleAssignState = (
    state: CropZoomAssignableState,
    animate: boolean = true
  ) => {
    const toScale = clamp(state.scale, minScale, maxScale.value);

    const { x: boundX, y: boundY } = boundsFn(toScale);
    const toX = clamp(state.translateX, -1 * boundX, boundX);
    const toY = clamp(state.translateY, -1 * boundY, boundY);

    const DEG90 = Math.PI / 2;
    const toRotate = Math.floor((state.rotate % (Math.PI * 2)) / DEG90) * DEG90;
    const toRotateX = Math.sign(state.rotateX - DEG90) === 1 ? Math.PI : 0;
    const toRotateY = Math.sign(state.rotateY - DEG90) === 1 ? Math.PI : 0;

    if (animate) {
      translate.x.value = withTiming(toX);
      translate.y.value = withTiming(toY);
      scale.value = withTiming(toScale);
      rotation.value = withTiming(toRotate);
      rotate.x.value = withTiming(toRotateX);
      rotate.y.value = withTiming(toRotateY);
      return;
    }

    translate.x.value = toX;
    translate.y.value = toY;
    scale.value = toScale;
    rotation.value = toRotate;
    rotate.x.value = toRotateX;
    rotate.y.value = toRotateY;
  };

  useImperativeHandle(ref, () => ({
    rotate: (animate, cb) => handleRotate(animate, true, cb),
    rotateWithDirection: handleRotate,
    flipHorizontal: flipHorizontal,
    flipVertical: flipVertical,
    reset: handleReset,
    crop: handleCrop,
    requestState: handleRequestState,
    assignState: handleAssignState,
  }));

  const root: ViewStyle = {
    minWidth: cropSize.width,
    minHeight: cropSize.height,
  };

  const cropStyle: ViewStyle = {
    width: cropSize.width,
    height: cropSize.height,
  };

  const reflectionSyle: ViewStyle = {
    backgroundColor: debug ? containerColor : undefined,
  };

  if (mode === CropMode.MANAGED) {
    return (
      <GestureHandlerRootView style={[root, styles.root]}>
        <View style={[cropStyle, styles.center]}>
          <Animated.View style={containerStyle}>{children}</Animated.View>
          <View style={[reflectionSyle, StyleSheet.absoluteFill]} />
        </View>

        <View style={[styles.absolute, styles.center]}>
          {OverlayComponent?.()}
        </View>

        <GestureDetector gesture={Gesture.Race(pinch, pan, tap)}>
          <Animated.View style={detectorStyle} />
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={[cropStyle, styles.center]}>
      <View style={[reflectionSyle, StyleSheet.absoluteFill]} />

      <GestureDetector gesture={Gesture.Race(pinch, pan)}>
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
  absolute: {
    flex: 1,
    position: 'absolute',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withCropValidation<CropZoomType, CropZoomProps>(CropZoom);
