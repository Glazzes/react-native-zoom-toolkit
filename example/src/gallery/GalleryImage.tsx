import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import {
  runOnJS,
  useAnimatedReaction,
  type SharedValue,
} from 'react-native-reanimated';
import { type Asset } from 'expo-media-library';

import { getAspectRatioSize } from 'react-native-zoom-toolkit';

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

  const phoneRatio = width / height;
  const pictureRatio = asset.width / asset.height;
  let size = getAspectRatioSize({
    aspectRatio: pictureRatio,
    width: height > width ? width : undefined,
    height: height > width ? undefined : height,
  });

  if (pictureRatio > phoneRatio && phoneRatio > 1) {
    size = getAspectRatioSize({ aspectRatio: pictureRatio, width });
  }

  if (pictureRatio < phoneRatio && phoneRatio < 1) {
    size = getAspectRatioSize({ aspectRatio: pictureRatio, height });
  }

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

  return <Image source={asset.uri} style={size} allowDownscaling={downScale} />;
};

export default GalleryImage;
