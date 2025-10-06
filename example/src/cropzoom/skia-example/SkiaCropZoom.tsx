import React, { useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import {
  Canvas,
  Image,
  useImage,
  vec,
  ColorMatrix,
  Lerp,
  useCanvasRef,
} from '@shopify/react-native-skia';
import {
  CropZoom,
  type CropZoomRefType,
  useTransformationState,
} from 'react-native-zoom-toolkit';

import CropModal from '../commons/CropModal';
import SVGOverlay from '../commons/SVGOverlay';
import Controls from './Controls';
import {
  IMAGE,
  CONTROLS_HEIGHT,
  blackAndWhite,
  indentity,
} from '../commons/contants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SkiaCropZoom = () => {
  const canvasRef = useCanvasRef();
  const ref = useRef<CropZoomRefType>(null);

  const image = useImage(IMAGE);
  const { onUpdate, transform, state } = useTransformationState('crop');

  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [cropImage, setCropImage] = useState<string | undefined>(undefined);

  const cropSize = screenWidth * 0.8;

  const progress = useSharedValue(0);
  const posX = useDerivedValue(
    () => (screenWidth - state.childSize.width.value) / 2,
    [state, screenWidth]
  );

  const posY = useDerivedValue(
    () =>
      (screenHeight
        - CONTROLS_HEIGHT
        - insets.bottom
        - state.childSize.height.value) /
      2,
    [state, screenHeight]
  );

  function renderOverlay() {
    return <SVGOverlay cropSize={{ width: cropSize, height: cropSize }} />;
  }

  if (image === null) {
    return null;
  }

  const resolution = { width: image.width(), height: image.height() };

  return (
    <View style={styles.root}>
      {/* @ts-ignore */}
      <Canvas ref={canvasRef} style={StyleSheet.absoluteFill}>
        <Image
          x={posX}
          y={posY}
          width={state.childSize.width}
          height={state.childSize.height}
          image={image}
          fit={'cover'}
          origin={vec(screenWidth / 2, (screenHeight - CONTROLS_HEIGHT - insets.bottom) / 2)}
          transform={transform}
        >
          <Lerp t={progress}>
            <ColorMatrix matrix={indentity} />
            <ColorMatrix matrix={blackAndWhite} />
          </Lerp>
        </Image>
      </Canvas>

      <View style={styles.container}>
        <CropZoom
          ref={ref}
          cropSize={{ width: cropSize, height: cropSize }}
          resolution={resolution}
          onUpdate={onUpdate}
          OverlayComponent={renderOverlay}
        />
      </View>

      <Controls
        progress={progress}
        image={image}
        // @ts-ignore
        cropRef={ref}
        setCrop={setCropImage}
      />

      {cropImage !== undefined ? (
        <CropModal uri={cropImage} setCrop={setCropImage} />
      ) : null}

      <StatusBar style="light" translucent={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});

export default SkiaCropZoom;
