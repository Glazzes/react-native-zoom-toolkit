import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, Image, useImage, vec } from '@shopify/react-native-skia';
import {
  fitContainer,
  ResumableZoom,
  useTransformationState,
} from 'react-native-zoom-toolkit';

import { StatusBar } from 'expo-status-bar';

const uri =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const App = () => {
  const image = useImage(uri);
  const { width, height } = useWindowDimensions();
  const { onUpdate, transform } = useTransformationState('resumable');

  if (image === null) {
    return null;
  }

  const resolution = { width: image.width(), height: image.height() };
  const imageSize = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  const x = 0;
  const y = (height - imageSize.height) / 2;
  const centerX = width / 2;
  const centerY = y + imageSize.height / 2;

  return (
    <View style={styles.root}>
      <Canvas style={{ width, height }}>
        <Image
          image={image}
          x={x}
          y={y}
          width={imageSize.width}
          height={imageSize.height}
          origin={vec(centerX, centerY)}
          transform={transform}
        />
      </Canvas>

      <View style={[styles.absolute, { width, height }]}>
        <ResumableZoom
          maxScale={resolution}
          extendGestures={true}
          pinchMode={'free'}
          onUpdate={onUpdate}
        >
          <View style={{ width: imageSize.width, height: imageSize.height }} />
        </ResumableZoom>
      </View>

      <StatusBar style="light" translucent={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#151515',
  },
  absolute: {
    position: 'absolute',
  },
});

export default App;
