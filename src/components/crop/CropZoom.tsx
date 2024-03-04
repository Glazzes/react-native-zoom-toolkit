import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useVector } from '../../commons/hooks/useVector';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import canvasToSize from './utils';
import { useSize } from '../../commons/hooks/useSize';
import { getRotatedSize } from '../../commons/utils/getRotatedSize';
import { usePanCommons } from '../../commons/hooks/usePanCommons';

import type { BoundFuction, SizeVector } from '../../commons/types';
import type { CropZoomType, CropZoomProps, CropContextResult } from './types';
import { usePinchCommons } from '../../commons/hooks/usePinchCommons';

const RAD2DEG = 180 / Math.PI;
const detectorColor = 'rgba(50, 168, 82, 0.5)';
const containerColor = 'rgba(255, 242, 105, 0.5)';

const CropZoom = forwardRef<CropZoomType, CropZoomProps>((props, ref) => {
  const {
    debug,
    cropSize,
    resolution,
    children,
    maxScale = Number.MAX_SAFE_INTEGER,
    scaleMode = 'bounce',
    panMode = 'free',
    panWithPinch = true,
    onGestureActive,
  } = props;

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const origin = useVector(0, 0);

  const rotation = useSharedValue<number>(0);
  const rotate = useVector(0, 0);

  const delta = useVector(0, 0);
  const scale = useSharedValue<number>(1);
  const scaleOffset = useSharedValue<number>(1);

  const container = useSize(cropSize.width, cropSize.height);
  const detector = useSize(cropSize.width, cropSize.height);
  const sizeAngle = useSharedValue<number>(0);

  const detectorTranslate = useVector(0, 0);
  const detectorScale = useSharedValue<number>(1);

  useDerivedValue(() => {
    const size = getRotatedSize({
      size: cropSize,
      aspectRatio: resolution.width / resolution.height,
      angle: sizeAngle.value,
    });

    container.width.value = withTiming(size.width);
    container.height.value = withTiming(size.height);

    const isFlipped = rotation.value % Math.PI === Math.PI / 2;
    detector.width.value = isFlipped ? size.height : size.width;
    detector.height.value = isFlipped ? size.width : size.height;
  }, [cropSize, resolution, sizeAngle]);

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

  const setDetectionTransformation = (tx: number, ty: number, sc: number) => {
    'worklet';
    detectorTranslate.x.value = tx;
    detectorTranslate.y.value = ty;
    detectorScale.value = sc;
  };

  const getBounds: BoundFuction = (sc: number) => {
    'worklet';
    let size = { width: container.width.value, height: container.height.value };

    const isFlipped = rotation.value % Math.PI === Math.PI / 2;
    if (isFlipped) {
      size = { width: size.height, height: size.width };
    }

    const x = Math.max(0, size.width * sc - cropSize.width) / 2;
    const y = Math.max(0, size.height * sc - cropSize.height) / 2;
    return { x, y };
  };

  const { onPinchStart, onPinchUpdate, onPinchEnd } = usePinchCommons({
    detector,
    detectorTranslate,
    detectorScale,
    translate,
    offset,
    origin,
    scale,
    scaleOffset,
    maxScale,
    delta,
    panWithPinch,
    scaleMode,
    boundFn: getBounds,
  });

  const { onPanStart, onChange, onPanEnd } = usePanCommons({
    translate,
    detectorTranslate,
    offset,
    scale,
    detectorScale,
    panMode,
    boundFn: getBounds,
  });

  const pinch = Gesture.Pinch()
    .onStart(onPinchStart)
    .onUpdate(onPinchUpdate)
    .onEnd(onPinchEnd);

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(onPanStart)
    .onChange(onChange)
    .onEnd(onPanEnd);

  const detectorStyle = useAnimatedStyle(() => {
    return {
      width: detector.width.value,
      height: detector.height.value,
      position: 'absolute',
      zIndex: 1,
      backgroundColor: debug ? detectorColor : undefined,
      transform: [
        { translateX: detectorTranslate.x.value },
        { translateY: detectorTranslate.y.value },
        { scale: detectorScale.value },
      ],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      width: container.width.value,
      height: container.height.value,
      position: 'absolute',
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
        { rotateX: `${rotate.x.value}rad` },
        { rotateY: `${rotate.y.value}rad` },
      ],
    };
  });

  /*
   * Reference handling
   */
  const canAnimate = useSharedValue<boolean>(true);
  const handleRotate = (animate: boolean = true) => {
    if (!canAnimate.value) {
      return;
    }

    canAnimate.value = false;

    const toAngle = rotation.value + Math.PI / 2;
    sizeAngle.value = toAngle;
    if (animate) {
      translate.x.value = withTiming(0);
      translate.y.value = withTiming(0);
      scale.value = withTiming(1);

      rotation.value = withTiming(toAngle, undefined, (_) => {
        canAnimate.value = true;
        setDetectionTransformation(0, 0, 1);
        if (rotation.value === Math.PI * 2) {
          rotation.value = 0;
        }
      });

      return;
    }

    translate.x.value = 0;
    translate.y.value = 0;
    scale.value = 1;
    setDetectionTransformation(0, 0, 1);
  };

  const handleFlipHorizontal = (animate: boolean = true) => {
    if (animate) {
      const toAngle = rotate.y.value !== Math.PI ? Math.PI : 0;
      rotate.y.value = withTiming(toAngle);
      return;
    }

    rotate.y.value = rotate.y.value !== Math.PI ? 0 : Math.PI;
  };

  const handleFlipVertical = (animate: boolean = true) => {
    if (animate) {
      const toAngle = rotate.x.value !== Math.PI ? Math.PI : 0;
      rotate.x.value = withTiming(toAngle);
      return;
    }

    rotate.x.value = rotate.x.value !== Math.PI ? 0 : Math.PI;
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
    const context = canvasToSize({
      cropSize: cropSize,
      resolution: resolution,
      position: { x: translate.x.value, y: translate.y.value },
      canvasSize: {
        width: container.width.value,
        height: container.height.value,
      },
      scale: scale.value,
      rotationAngle: rotation.value,
      fixedWidth,
    });

    let resize: SizeVector<number> | undefined;
    if (fixedWidth !== undefined) {
      resize = { width: context.resizeWidth, height: context.resizeHeight };
    }

    return {
      crop: {
        originX: context.x,
        originY: context.y,
        width: context.width,
        height: context.height,
      },
      context: {
        rotationAngle: rotation.value * RAD2DEG,
        flipHorizontal: rotate.y.value === Math.PI,
        flipVertical: rotate.x.value === Math.PI,
      },
      resize: resize,
    };
  };

  useImperativeHandle(ref, () => ({
    rotate: handleRotate,
    flipHorizontal: handleFlipHorizontal,
    flipVertical: handleFlipVertical,
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

  return (
    <View style={[root, styles.root]}>
      <View style={[cropStyle, styles.center]}>
        <Animated.View style={containerStyle}>{children}</Animated.View>
        <View style={[reflectionSyle, StyleSheet.absoluteFill]} />
        <GestureDetector gesture={Gesture.Race(pinch, pan)}>
          <Animated.View style={detectorStyle} />
        </GestureDetector>
      </View>
    </View>
  );
});

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

export default CropZoom;
