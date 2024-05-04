import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { getAspectRatioSize } from 'react-native-zoom-toolkit';
import {
  runOnJS,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

type GalleryImageProps = {
  uri: string;
  index: number;
  activeIndex: SharedValue<number>;
};

const GalleryImage: React.FC<GalleryImageProps> = ({
  uri,
  index,
  activeIndex,
}) => {
  const [allowD, setAllowD] = useState<boolean>(true);
  const { width, height } = useWindowDimensions();
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  }>({
    width: 1,
    height: 1,
  });

  const size = getAspectRatioSize({
    aspectRatio: (resolution?.width ?? 1) / (resolution?.height ?? 1),
    width: height > width ? width : undefined,
    height: height > width ? undefined : height,
  });

  useDerivedValue(() => {
    runOnJS(setAllowD)(!(index === activeIndex.value));
  }, [index, activeIndex]);

  return (
    <Image
      source={{ uri }}
      style={size}
      allowDownscaling={allowD}
      onLoad={(e) => {
        setResolution({
          width: e.source.width,
          height: e.source.height,
        });
      }}
    />
  );
};

export default GalleryImage;
