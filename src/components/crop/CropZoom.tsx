import React, { useImperativeHandle } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import { getCropRotatedSize } from '../../commons/utils/getCropRotatedSize';
import { usePanCommons } from '../../commons/hooks/usePanCommons';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';
import { getMaxScale } from '../../commons/utils/getMaxScale';
import { useVector } from '../../commons/hooks/useVector';
import { PanMode, type BoundsFuction, ScaleMode } from '../../commons/types';
import { canvasToSize } from './utils/canvasToSize';
import {
  CropMode,
  type CropZoomProps,
  type CropContextResult,
  type CropZoomType,
  type RotateTransitionCallback,
} from './types';
import withCropValidation from '../../commons/hoc/withCropValidation';
import { RAD2DEG } from '../../commons/constants';

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
    maxScale: userMaxScale = -1,
    scaleMode = ScaleMode.BOUNCE,
    panMode = PanMode.FREE,
    panWithPinch = Platform.OS !== 'ios',
    mode = CropMode.MANAGED,
    onGestureActive = undefined,
    OverlayComponent = undefined,
    onPanStart: onUserPanStart,
    onPanEnd: onUserPanEnd,
    onPinchStart: onUserPinchStart,
    onPinchEnd: onUserPinchEnd,
    onTap,
  } = props;

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const origin = useVector(0, 0);

  const rotation = useSharedValue<number>(0);
  const rotate = useVector(0, 0);

  const delta = useVector(0, 0);
  const scale = useSharedValue<number>(1);
  const scaleOffset = useSharedValue<number>(1);

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

    return userMaxScale < 0 ? scaleValue : userMaxScale;
  }, [container, userMaxScale, resolution]);

  useDerivedValue(() => {
    const size = getCropRotatedSize({
      size: cropSize,
      aspectRatio: resolution.width / resolution.height,
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
      boundFn: boundsFn,
      userCallbacks: {
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
  }, [translate, scale, rotation, rotate]);

  // Reference handling section
  const canRotate = useSharedValue<boolean>(true);
  const handleRotate: RotateTransitionCallback = (animate = true, cb) => {
    if (!canRotate.value) return;

    const toAngle = rotation.value + Math.PI / 2;
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
        if (rotation.value === Math.PI * 2) rotation.value = 0;
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
      scale.value = withTiming(1);

      return;
    }

    translate.x.value = 0;
    translate.y.value = 0;
    rotation.value = 0;
    rotate.x.value = 0;
    rotate.y.value = 0;
    scale.value = 1;
  };

  const handleCrop = (fixedWidth?: number): CropContextResult => {
    const angle = rotation.value * RAD2DEG;
    const flipH = rotate.y.value === Math.PI;
    const flipV = rotate.x.value === Math.PI;

    return canvasToSize({
      cropSize: cropSize,
      resolution: resolution,
      canvas: { width: container.width.value, height: container.height.value },
      position: { x: translate.x.value, y: translate.y.value },
      scale: scale.value,
      context: {
        rotationAngle: angle,
        flipHorizontal: flipH,
        flipVertical: flipV,
      },
      fixedWidth,
    });
  };

  useImperativeHandle(ref, () => ({
    rotate: handleRotate,
    flipHorizontal: flipHorizontal,
    flipVertical: flipVertical,
    reset: handleReset,
    crop: handleCrop,
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
      <View style={[root, styles.root]}>
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
      </View>
    );
  }

  return (
    <View style={[cropStyle, styles.center]}>
      <View style={[reflectionSyle, StyleSheet.absoluteFill]} />

      <GestureDetector gesture={Gesture.Race(pinch, pan)}>
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
