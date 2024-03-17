import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { PREVIEW_SIZE } from './constants';
import { theme } from '../../constants';

type PreviewImageProps = {
  uri: string;
  index: number;
  scrollTo: (index: number) => void;
};

const PreviewImage: React.FC<PreviewImageProps> = ({
  uri,
  index,
  scrollTo,
}) => {
  const onPress = () => {
    scrollTo(index);
  };

  return (
    <Pressable onPress={onPress}>
      <Image source={{ uri }} contentFit={'cover'} style={styles.image} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  image: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: theme.spacing.s,
  },
});

export default PreviewImage;
