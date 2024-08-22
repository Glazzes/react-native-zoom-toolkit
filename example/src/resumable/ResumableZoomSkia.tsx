import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import {
  Canvas,
  Image,
  useImage,
  vec,
  type Transforms3d,
} from '@shopify/react-native-skia';
import { ResumableZoom, getAspectRatioSize } from 'react-native-zoom-toolkit';

import type { CommonZoomState } from 'react-native-zoom-toolkit';
import { StatusBar } from 'expo-status-bar';

type ResumableTransformationValues = {
  transform: Readonly<SharedValue<Transforms3d>>;
  onUpdate: (state: CommonZoomState) => void;
};

const useResumableValues = (): ResumableTransformationValues => {
  const translateX = useSharedValue<number>(0);
  const translateY = useSharedValue<number>(0);
  const scale = useSharedValue<number>(1);

  const transform = useDerivedValue<Transforms3d>(() => {
    return [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ];
  }, [scale, translateY, translateX]);

  const onUpdate = (updateState: CommonZoomState) => {
    'worklet';
    translateX.value = updateState.translateX;
    translateY.value = updateState.translateY;
    scale.value = updateState.scale;
  };

  return { onUpdate, transform };
};

const uri =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const App = () => {
  const image = useImage(uri);
  const { width, height } = useWindowDimensions();
  const { onUpdate, transform } = useResumableValues();

  if (image === null) {
    return null;
  }

  const resolution = { width: image.width(), height: image.height() };
  const imageSize = getAspectRatioSize({
    aspectRatio: resolution.width / resolution.height,
    width: width,
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

      <View style={{ width, height, position: 'absolute' }}>
        <ResumableZoom
          maxScale={resolution}
          extendGestures={true}
          onGestureActive={onUpdate}
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
});

export default App;
