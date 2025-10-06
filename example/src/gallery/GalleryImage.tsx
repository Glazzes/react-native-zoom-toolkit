import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  useAnimatedReaction,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets'
import { Image } from 'expo-image';
import { type Asset } from 'expo-media-library';

import { fitContainer } from 'react-native-zoom-toolkit';

type GalleryImageProps = {
  asset: Asset;
  index: number;
  activeIndex: SharedValue<number>;
};

export default function GalleryImage(props: GalleryImageProps) {
  const { width, height } = useWindowDimensions();
  const size = fitContainer(props.asset.width / props.asset.height, { width, height });

  const [downScale, setDownScale] = useState<boolean>(true);

  const wrapper = (active: number) => {
    if (props.index === active) setDownScale(false);
    if (props.index === active - 1 && !downScale) setDownScale(true);
    if (props.index === active + 1 && !downScale) setDownScale(true);
  };

  useAnimatedReaction(
    () => props.activeIndex.value,
    (value) => scheduleOnRN(wrapper, value),
    [props.activeIndex]
  );

  return (
    <Image
      source={{ uri: props.asset.uri }}
      style={size}
      allowDownscaling={downScale}
    />
  );
};
