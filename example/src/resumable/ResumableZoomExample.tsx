import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import Constants from 'expo-constants';
import { StatusBar, setStatusBarHidden } from 'expo-status-bar';

import {
  fitContainer,
  ResumableZoom,
  useImageResolution,
  type ResumableZoomRefType,
} from 'react-native-zoom-toolkit';

import Appbar from './Appbar';

const barHeight = Constants.statusBarHeight;
const IMAGE =
  'https://media.formula1.com/image/upload/v1705423544/fom-website/2023/McLaren/Formula%201%20header%20template%20%2835%29.png';

const ResumableZoomExample: React.FC = ({}) => {
  const ref = useRef<ResumableZoomRefType>(null);
  const { width, height } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri: IMAGE });

  const translateY = useSharedValue<number>(0);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => {
      ref.current?.reset(false);
    });

    return () => sub.remove();
  }, [ref]);

  if (isFetching || resolution === undefined) {
    return null;
  }

  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  const onTap = () => {
    let toY = -1 * barHeight * 3.1;
    if (translateY.value !== 0) toY = 0;

    translateY.value = withTiming(toY);
    setStatusBarHidden(toY !== 0, 'slide');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Appbar translateY={translateY} />

      <ResumableZoom
        ref={ref}
        extendGestures={true}
        maxScale={resolution}
        pinchMode={'free'}
        onTap={onTap}
      >
        <Image
          source={{ uri: IMAGE }}
          style={{ width: size.width, height: size.height }}
          resizeMethod="scale"
        />
      </ResumableZoom>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pressable: {
    width: 80,
    height: 80,
    backgroundColor: 'orange',
  },
});

export default ResumableZoomExample;
