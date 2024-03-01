import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { useVector } from '../../commons/hooks/useVector';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { CropZoomType, CropZoomProps, CropContextResult } from './types';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { pinchTransform } from '../../commons/utils/pinchTransform';
import { clamp } from '../../commons/utils/clamp';
import canvasToSize from './utils';
import type { SizeVector } from '../../commons/types';
import { useSize } from '../../commons/hooks/useSize';
import { getRotatedSize } from '../../commons/utils/getRotatedSize';

const RAD2DEG = 180 / Math.PI;

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

  const scale = useSharedValue<number>(1);
  const scaleOffset = useSharedValue<number>(1);

  const container = useSize(cropSize.width, cropSize.height);
  const detector = useSize(cropSize.width, cropSize.height);
  const sizeAngle = useSharedValue<number>(0);

  const gestureTranslate = useVector(0, 0);
  const gestureScale = useSharedValue<number>(1);

  useDerivedValue(() => {
    const size = getRotatedSize({
      size: cropSize,
      aspectRatio: resolution.width / resolution.height,
      angle: sizeAngle.value,
    });

    const isFlipped = rotation.value % Math.PI === Math.PI / 2;
    detector.width.value = isFlipped ? size.height : size.width;
    detector.height.value = isFlipped ? size.width : size.height;

    container.width.value = withTiming(size.width);
    container.height.value = withTiming(size.height);
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
  }, [translate, scale, rotate, rotation]);

  const setDetectionTransformation = (tx: number, ty: number, sc: number) => {
    'worklet';
    gestureTranslate.x.value = tx;
    gestureTranslate.y.value = ty;
    gestureScale.value = sc;
  };

  const getBounds = (sc: number) => {
    'worklet';
    let size = { width: container.width.value, height: container.height.value };

    const isFlipped = rotation.value % Math.PI === Math.PI / 2;
    if (isFlipped) {
      size = { width: size.height, height: size.width };
    }

    const boundX = Math.max(0, size.width * sc - cropSize.width) / 2;
    const boundY = Math.max(0, size.height * sc - cropSize.height) / 2;
    return { boundX, boundY };
  };

  const delta = useVector(0, 0);

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      origin.x.value = e.focalX - detector.width.value / 2;
      origin.y.value = e.focalY - detector.height.value / 2;

      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
      scaleOffset.value = scale.value;
    })
    .onUpdate((e) => {
      const toScale = e.scale * scaleOffset.value;
      delta.x.value = e.focalX - detector.width.value / 2 - origin.x.value;
      delta.y.value = e.focalY - detector.height.value / 2 - origin.y.value;

      const { x: toX, y: toY } = pinchTransform({
        toScale: toScale,
        fromScale: scaleOffset.value,
        origin: { x: origin.x.value, y: origin.y.value },
        offset: { x: offset.x.value, y: offset.y.value },
        delta: {
          x: panWithPinch ? delta.x.value * scaleOffset.value : 0,
          y: panWithPinch ? delta.y.value * scaleOffset.value : 0,
        },
      });

      translate.x.value = toX;
      translate.y.value = toY;
      scale.value = toScale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        translate.x.value = withTiming(0);
        translate.y.value = withTiming(0);
        scale.value = withTiming(1);

        setDetectionTransformation(0, 0, 1);
        return;
      }

      if (scale.value > maxScale && scaleMode === 'bounce') {
        const { x, y } = pinchTransform({
          toScale: maxScale,
          fromScale: scale.value,
          origin: { x: origin.x.value, y: origin.y.value },
          offset: { x: translate.x.value, y: translate.y.value },
          delta: {
            x: -1 * delta.x.value * scaleOffset.value,
            y: -1 * delta.y.value * scaleOffset.value,
          },
        });

        translate.x.value = withTiming(x);
        translate.y.value = withTiming(y);
        scale.value = withTiming(maxScale);
        setDetectionTransformation(x, y, maxScale);
        return;
      }

      const { boundX, boundY } = getBounds(scale.value);
      const toX = clamp(translate.x.value, -1 * boundX, boundX);
      const toY = clamp(translate.y.value, -1 * boundY, boundY);

      translate.x.value = withTiming(toX);
      translate.y.value = withTiming(toY);
      setDetectionTransformation(toX, toY, scale.value);
    });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart((_) => {
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onUpdate(({ translationX, translationY }) => {
      const toX = translationX + offset.x.value;
      const toY = translationY + offset.y.value;

      if (panMode === 'free') {
        translate.x.value = toX;
        translate.y.value = toY;
        return;
      }

      const { boundX, boundY } = getBounds(scale.value);
      translate.x.value = clamp(toX, -1 * boundX, boundX);
      translate.y.value = clamp(toY, -1 * boundY, boundY);
    })
    .onEnd((_) => {
      const { boundX, boundY } = getBounds(scale.value);
      const toX = clamp(translate.x.value, -1 * boundX, boundX);
      const toY = clamp(translate.y.value, -1 * boundY, boundY);

      translate.x.value = withTiming(toX);
      translate.y.value = withTiming(toY);
      setDetectionTransformation(toX, toY, scale.value);
    });

  const detectorStyle = useAnimatedStyle(() => {
    return {
      width: detector.width.value,
      height: detector.height.value,
      position: 'absolute',
      backgroundColor: debug ? 'rgba(0, 0, 255, 0.5)' : undefined,
      zIndex: 100,
      transform: [
        { translateX: gestureTranslate.x.value },
        { translateY: gestureTranslate.y.value },
        { scale: gestureScale.value },
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

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.crop,
          { width: cropSize.width, height: cropSize.height },
        ]}
      >
        <Animated.View style={containerStyle}>{children}</Animated.View>
        <GestureDetector gesture={Gesture.Race(pinch, pan)}>
          <Animated.View style={detectorStyle} />
        </GestureDetector>
        <View
          style={[
            styles.reflection,
            { backgroundColor: debug ? 'rgba(255, 0, 0, 0.5)' : undefined },
          ]}
          pointerEvents="none"
        />
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
  crop: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reflection: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default CropZoom;
