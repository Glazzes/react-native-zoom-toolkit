import React, { useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
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
import { StatusBar } from 'expo-status-bar';
import {
  CropZoom,
  type CropZoomRefType,
  useTransformationState,
} from 'react-native-zoom-toolkit';

import CropModal from '../commons/CropModal';
import SVGOverlay from '../commons/SVGOverlay';
import Controls from './Controls';
import {
  buttonSize,
  blackAndWhite,
  CONTROLS_HEIGHT,
  indentity,
} from '../commons/contants';
import { theme } from '../../constants';

const IMAGE =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const SkiaCropZoom = () => {
  const canvasRef = useCanvasRef();
  const ref = useRef<CropZoomRefType>(null);

  const image = useImage(IMAGE);
  const { onUpdate, transform, state } = useTransformationState('crop');

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [cropImage, setCropImage] = useState<string | undefined>(undefined);

  const cropSize = screenWidth * 0.9;

  const progress = useSharedValue(0);
  const posX = useDerivedValue(
    () => (screenWidth - state.childSize.width.value) / 2,
    [state, screenWidth]
  );

  const posY = useDerivedValue(
    () =>
      (screenHeight -
        state.childSize.height.value -
        buttonSize -
        theme.spacing.s) /
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
          origin={vec(screenWidth / 2, (screenHeight - CONTROLS_HEIGHT) / 2)}
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
