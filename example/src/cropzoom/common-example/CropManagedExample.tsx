import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  CropZoom,
  useImageResolution,
  type CropZoomType,
} from 'react-native-zoom-toolkit';

import Controls from './Controls';
import CropModal from '../commons/CropModal';
import CropOverlay from '../commons/CropOverlay';

const IMAGE =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const CropManagedExample = ({}) => {
  const ref = useRef<CropZoomType>(null);
  const [result, setResult] = useState<string | undefined>(undefined);

  const { width } = useWindowDimensions();
  const cropSize = width * 0.9;

  const { resolution } = useImageResolution({ uri: IMAGE });

  // Renders an svg with a hole in it
  const renderOverlay = useCallback(() => {
    return <CropOverlay cropSize={cropSize} />;
  }, [cropSize]);

  if (resolution === undefined) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="transparent" />
      <CropZoom
        ref={ref}
        cropSize={{ width: cropSize, height: cropSize }}
        resolution={resolution}
        OverlayComponent={renderOverlay}
      >
        <Image source={{ uri: IMAGE }} style={styles.image} />
      </CropZoom>

      {/*
       * This component background is equals to the one seen in the canvas above
       * The height of this component is subtracted from the screen height, so the overlay
       * height is screen height - controls height
       */}
      <Controls uri={IMAGE} cropRef={ref} setCrop={setResult} />

      {/*
       * Display a modal with the resulting crop, nothing relevant in that component
       */}
      {result !== undefined ? (
        <CropModal uri={result} setCrop={setResult} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  image: {
    flex: 1,
  },
});

export default CropManagedExample;
