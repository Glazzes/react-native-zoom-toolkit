import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  stackTransition,
  Gallery,
  type GalleryType,
} from 'react-native-zoom-toolkit';
import {
  getAssetsAsync,
  requestPermissionsAsync,
  type Asset,
} from 'expo-media-library';

import GalleryImage from './GalleryImage';
import { StyleSheet } from 'react-native';

type SizeVector = { width: number; height: number };

const GalleryExample = () => {
  const ref = useRef<GalleryType>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [scales, setScales] = useState<SizeVector[]>([]);

  const activeIndex = useSharedValue<number>(0);

  const renderItem = useCallback(
    (item: Asset, index: number) => {
      return (
        <GalleryImage asset={item} index={index} activeIndex={activeIndex} />
      );
    },
    [activeIndex]
  );

  const customTransition = useCallback(stackTransition, []);

  useEffect(() => {
    const requestAssets = async () => {
      const { granted } = await requestPermissionsAsync();
      if (granted) {
        const page = await getAssetsAsync({
          first: 100,
          mediaType: 'photo',
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
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        renderItem={renderItem}
        maxScale={scales}
        onIndexChange={(idx) => {
          activeIndex.value = idx;
        }}
        customTransition={customTransition}
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
