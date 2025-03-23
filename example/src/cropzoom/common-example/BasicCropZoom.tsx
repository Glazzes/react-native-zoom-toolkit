import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  CropZoom,
  useImageResolution,
  type CropZoomType,
  type SizeVector,
} from 'react-native-zoom-toolkit';

import CropModal from '../commons/CropModal';
import SVGOverlay from '../commons/SVGOverlay';
import Controls from './Controls';

const IMAGE =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const BasicCropZoom = ({}) => {
  const cropRef = useRef<CropZoomType>(null);

  const { width } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri: IMAGE });

  const [result, setResult] = useState<string | undefined>(undefined);

  const cropSize: SizeVector<number> = {
    width: width * 0.8,
    height: width * 0.8,
  };

  const renderOverlay = () => {
    return <SVGOverlay cropSize={cropSize} />;
  };

  if (isFetching || resolution === undefined) {
    return null;
  }

  return (
    <View style={styles.root}>
      <CropZoom
        ref={cropRef}
        cropSize={cropSize}
        resolution={resolution}
        OverlayComponent={renderOverlay}
      >
        <Image
          source={{ uri: IMAGE }}
          style={styles.image}
          resizeMethod="scale"
        />
      </CropZoom>

      {/*
       * This component background is equals to the one seen in the canvas above
       * The height of this component is subtracted from the screen height, so the overlay
       * height is screen height - controls height
       */}
      <Controls uri={IMAGE} cropRef={cropRef} setCrop={setResult} />

      {/*
       * Display a modal with the resulting crop, nothing relevant in that component
       */}
      {result !== undefined ? (
        <CropModal uri={result} setCrop={setResult} />
      ) : null}

      <StatusBar style="light" translucent={true} />
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
    width: '100%',
    height: '100%',
  },
});

export default BasicCropZoom;
