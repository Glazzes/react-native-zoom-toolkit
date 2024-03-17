import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  type ImageStyle,
} from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { setStatusBarHidden } from 'expo-status-bar';
import { getAspectRatioSize, useImageResolution } from 'react-native-zoomable';

import Appbar from './Appbar';
import ResumableZoom from '../../../../src/components/resumable/ResumableZoom';
import type { ResumableZoomType } from '../../../../src/components/resumable/types';

const barHeight = Constants.statusBarHeight;
const IMAGE =
  'https://www.zooplus.es/magazine/wp-content/uploads/2019/04/labrador-3-Farben.jpg';

const ResumableZoomExample: React.FC = ({}) => {
  const ref = useRef<ResumableZoomType>(null);
  const { width, height } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri: IMAGE });

  const translateY = useSharedValue<number>(0);

  useEffect(() => {
    ref.current?.reset(false);
  }, [width, height]);

  if (isFetching || resolution === undefined) {
    return null;
  }

  const isPortrait = height > width;

  const { width: imageWidth, height: imageHeight } = getAspectRatioSize({
    aspectRatio: resolution.width / resolution.height,
    maxWidth: isPortrait ? width : undefined,
    maxHeight: isPortrait ? undefined : height,
  });

  const imageStyle: ImageStyle = {
    width: imageWidth,
    height: imageHeight,
  };

  const onTap = () => {
    let toY = -1 * barHeight * 3.1;
    if (translateY.value !== 0) {
      toY = 0;
    }

    translateY.value = withTiming(toY);
    setStatusBarHidden(toY !== 0, 'slide');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Appbar translateY={translateY} />

      <ResumableZoom
        ref={ref}
        hitSlop={{ vertical: 50 }}
        maxScale={resolution}
        onTap={onTap}
      >
        <Image
          source={{ uri: IMAGE }}
          style={imageStyle}
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
});

export default ResumableZoomExample;
