import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import {
  CropZoom,
  useImageSize,
  PanMode,
  ScaleMode,
  type CropZoomType,
} from '../../../../src';
import { StatusBar } from 'expo-status-bar';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import EffectIndicator from './EffectIndicator';
import CropModal from '../commons/CropModal';

const IMAGE =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const { width, height } = Dimensions.get('screen');
const center = { x: width / 2, y: height * 0.5 };

const CropManagedExample = ({}) => {
  const ref = useRef<CropZoomType>(null);

  const [result, setResult] = useState<string | undefined>(undefined);

  const { size } = useImageSize({ uri: IMAGE });
  const cropSize = width * 0.9;
  const radius = cropSize / 2;

  const path = Skia.Path.MakeFromSVGString(
    `M 0 0 h ${width} v ${height} h ${-width} v ${-height} M ${
      center.x - radius
    } ${center.y} a 1 1 0 0 0 ${radius * 2} 0 a 1 1 0 0 0 ${-1 * radius * 2} 0`
  )!;

  if (size === undefined) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="transparent" />
      <CropZoom
        debug={false}
        ref={ref}
        cropSize={{ width: cropSize, height: cropSize }}
        resolution={size}
        panMode={PanMode.FREE}
        scaleMode={ScaleMode.BOUNCE}
        panWithPinch={true}
      >
        <Image source={{ uri: IMAGE }} style={styles.image} />
      </CropZoom>

      <Canvas style={styles.flex}>
        <Path path={path} color={'rgba(0, 0, 0, 0.5)'} />
      </Canvas>

      <EffectIndicator uri={IMAGE} cropRef={ref} setCrop={setResult} />

      {result !== undefined ? (
        <CropModal uri={result} setCrop={setResult} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    width,
    height,
    position: 'absolute',
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CropManagedExample;
