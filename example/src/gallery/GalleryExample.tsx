import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import {
  stackTransition,
  Gallery,
  type GalleryType,
} from 'react-native-zoom-toolkit';
import {
  getAssetsAsync,
  MediaType,
  requestPermissionsAsync,
  type Asset,
} from 'expo-media-library';

import GalleryImage from './GalleryImage';
import { StyleSheet } from 'react-native';
import VideoControls from './controls/VideoControls';
import GalleryVideo from './GalleryVideo';

type SizeVector = { width: number; height: number };

const GalleryExample = () => {
  const ref = useRef<GalleryType>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [scales, setScales] = useState<SizeVector[]>([]);

  const progress = useSharedValue<number>(0);
  const opacityControls = useSharedValue<number>(0);
  const activeIndex = useSharedValue<number>(0);

  // This value is used to prevent the timer to keep updating the current position
  // when the user is dragging the bar to a position of their desire
  const isSeeking = useSharedValue<boolean>(false);

  const renderItem = useCallback(
    (item: Asset, index: number) => {
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
  const customTransition = useCallback(stackTransition, []);

  // Toogle video controls opacity if the current item is a video
  const onTap = useCallback(() => {
    const isVideo = assets[activeIndex.value]?.mediaType === MediaType.video;
    if (!isVideo) return;

    const toValue = opacityControls.value > 0 ? 0 : 1;
    opacityControls.value = withTiming(toValue);
  }, [assets, activeIndex, opacityControls]);

  useEffect(() => {
    const requestAssets = async () => {
      const { granted } = await requestPermissionsAsync();
      if (granted) {
        const page = await getAssetsAsync({
          first: 100,
          mediaType: ['photo', 'video'],
          sortBy: 'creationTime',
        });

        const pageScales: SizeVector[] = [];
        for (let asset of page.assets) {
          pageScales.push({ width: asset.width, height: asset.height });
        }

        setAssets(page.assets);
        setScales(pageScales);
      }
    };

    requestAssets();
  }, []);

  if (assets.length === 0 || scales.length === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Gallery
        ref={ref}
        data={assets}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        maxScale={scales}
        onIndexChange={(idx) => {
          activeIndex.value = idx;
        }}
        onTap={onTap}
        customTransition={customTransition}
      />

      <VideoControls
        assets={assets}
        activeIndex={activeIndex}
        progress={progress}
        isSeeking={isSeeking}
        opacity={opacityControls}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default GalleryExample;
