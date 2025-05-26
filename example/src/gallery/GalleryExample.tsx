import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  getAssetsAsync,
  requestPermissionsAsync,
  MediaType,
  type Asset,
} from 'expo-media-library';
import { Gallery, type GalleryRefType } from 'react-native-zoom-toolkit';

import GalleryImage from './GalleryImage';
import VideoControls from './controls/VideoControls';
import GalleryVideo from './GalleryVideo';
import { StatusBar } from 'expo-status-bar';

type SizeVector = { width: number; height: number };

const GalleryExample = () => {
  const ref = useRef<GalleryRefType>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [scales, setScales] = useState<SizeVector[]>([]);

  const progress = useSharedValue<number>(0);
  const opacityControls = useSharedValue<number>(0);
  const activeIndex = useSharedValue<number>(0);

  // This value is used to prevent the timer to keep updating the current position
  // when the user is dragging the bar to a position of their desire
  const isSeeking = useSharedValue<boolean>(false);

  const renderItem = useCallback(
    (item: Asset, index: number): React.ReactElement => {
      if (item.mediaType === MediaType.video) {
        return (
          <GalleryVideo
            asset={item}
            index={index}
            isLooping={true}
            progress={progress}
            isSeeking={isSeeking}
          />
        );
      }

      return (
        <GalleryImage asset={item} index={index} activeIndex={activeIndex} />
      );
    },
    [activeIndex, progress, isSeeking]
  );

  const keyExtractor = useCallback((item, index) => `${item.uri}-${index}`, []);

  // Toogle video controls opacity if the current item is a video
  const onTap = useCallback(() => {
    const isVideo = assets[activeIndex.value]?.mediaType === MediaType.video;
    if (!isVideo) return;

    const toValue = opacityControls.value > 0 ? 0 : 1;
    opacityControls.value = withTiming(toValue);
  }, [assets, activeIndex, opacityControls]);

  // used to derived the color animation when pulling vertically
  const translateY = useSharedValue<number>(0);
  const onVerticalPulling = (ty: number) => {
    'worklet';
    translateY.value = ty;
  };

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      translateY.value,
      [-150, 0, 150],
      ['#fff', '#000', '#fff'],
      'RGB',
      { gamma: 2.2 }
    );

    return { backgroundColor: color };
  });

  useEffect(() => {
    const requestAssets = async () => {
      const { granted } = await requestPermissionsAsync();
      if (!granted) return;

      const page = await getAssetsAsync({
        first: 100,
        mediaType: ['photo'],
        sortBy: 'creationTime',
      });

      const pageScales: SizeVector[] = [];
      for (let asset of page.assets) {
        pageScales.push({ width: asset.width, height: asset.height });
      }

      setAssets(page.assets);
      setScales(pageScales);
    };

    requestAssets();
  }, []);

  if (assets.length === 0 || scales.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.root, animatedStyle]}>
      <Gallery
        ref={ref}
        data={assets}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        gap={24}
        maxScale={scales}
        onIndexChange={(idx) => {
          activeIndex.value = idx;
        }}
        onTap={onTap}
        pinchMode={'free'}
        onVerticalPull={onVerticalPulling}
      />

      <VideoControls
        assets={assets}
        activeIndex={activeIndex}
        progress={progress}
        isSeeking={isSeeking}
        opacity={opacityControls}
      />

      <StatusBar style="light" translucent={true} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default GalleryExample;
