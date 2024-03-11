import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import {
  CropZoom,
  useImageResolution,
  type CropZoomType,
} from 'react-native-zoomable';
import { StatusBar } from 'expo-status-bar';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Controls from './Controls';
import CropModal from '../commons/CropModal';
import { controlSize } from '../commons/contants';

const IMAGE =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const CropManagedExample = ({}) => {
  const ref = useRef<CropZoomType>(null);
  const [result, setResult] = useState<string | undefined>(undefined);

  const { width, height } = useWindowDimensions();
  const { resolution } = useImageResolution({ uri: IMAGE });
  const cropSize = width * 0.9;
  const overlayHeight = height - controlSize;

  const renderOverlay = useCallback(() => {
    const center = { x: width / 2, y: overlayHeight / 2 };

    const path = Skia.Path.MakeFromSVGString(
      `M 0 0 h ${width} v ${overlayHeight} h ${-width} v ${-overlayHeight} M ${
        center.x - cropSize / 2
      } ${center.y} a 1 1 0 0 0 ${cropSize} 0 a 1 1 0 0 0 ${-1 * cropSize} 0`
    )!;

    const overlayStyle: ViewStyle = {
      width: width,
      height: overlayHeight,
    };

    return (
      <Canvas style={overlayStyle}>
        <Path path={path} color={'rgba(0, 0, 0, 0.4)'} />
      </Canvas>
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

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
    width: '100%',
    height: '100%',
  },
});

export default CropManagedExample;
