import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  type SharedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { type Asset } from 'expo-media-library';

import { calculateItemSize } from './utils/utils';

type GalleryImageProps = {
  asset: Asset;
  index: number;
  activeIndex: SharedValue<number>;
};

const GalleryImage: React.FC<GalleryImageProps> = ({
  asset,
  index,
  activeIndex,
}) => {
  const [downScale, setDownScale] = useState<boolean>(true);
  const { width, height } = useWindowDimensions();

  const size = calculateItemSize(
    { width: asset.width, height: asset.height },
    { width, height },
    width / height
  );

  const wrapper = (active: number) => {
    if (index === active) setDownScale(false);
    if (index === active - 1 && !downScale) setDownScale(true);
    if (index === active + 1 && !downScale) setDownScale(true);
  };

  useAnimatedReaction(
    () => activeIndex.value,
    (value) => runOnJS(wrapper)(value),
    [activeIndex]
  );

  return (
    <Image
      source={{ uri: asset.uri }}
      style={size}
      allowDownscaling={downScale}
    />
  );
};

export default GalleryImage;
