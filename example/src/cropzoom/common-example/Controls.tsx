import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { FlipType, SaveFormat, ImageManipulator } from 'expo-image-manipulator';
import { createAlbumAsync, createAssetAsync } from 'expo-media-library';
import { type CropZoomRefType } from 'react-native-zoom-toolkit';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import { activeColor, baseColor } from '../commons/contants';
import { theme } from '../../constants';

type ControlProps = {
  uri: string;
  setCrop: (uri: string | undefined) => void;
  cropRef: React.RefObject<CropZoomRefType>;
};

const Controls: React.FC<ControlProps> = ({ uri, cropRef, setCrop }) => {
  const [isCropping, setIsCropping] = useState<boolean>(false);

  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [isFlippedV, setIsFlippedV] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);

  function rotate() {
    cropRef?.current?.rotate(true, true, (angle) => {
      setIsRotated(angle !== 0);
    });
  }

  function flipHorizontal() {
    cropRef?.current?.flipHorizontal(true, (angle) => {
      setIsFlippedH(angle === 180);
    });
  }

  function flipVertical() {
    cropRef.current?.flipVertical(true, (angle) => {
      setIsFlippedV(angle === 180);
    });
  }

  async function crop() {
    if (cropRef.current === null || isCropping) {
      return;
    }

    setIsCropping(true);
    const cropContext = cropRef.current.crop(300);
    const manipulateContext = ImageManipulator.manipulate(uri);

    if (cropContext.resize !== undefined)
      manipulateContext.resize(cropContext.resize);

    if (cropContext.context.flipHorizontal)
      manipulateContext.flip(FlipType.Horizontal);

    if (cropContext.context.flipVertical)
      manipulateContext.flip(FlipType.Vertical);

    if (cropContext.context.rotationAngle !== 0)
      manipulateContext.rotate(cropContext.context.rotationAngle);

    manipulateContext.crop(cropContext.crop);

    const imageRef = await manipulateContext.renderAsync();
    const result = await imageRef.saveAsync({
      compress: 1,
      format: SaveFormat.PNG,
    });

    const asset = await createAssetAsync(result.uri);
    await createAlbumAsync('cropping', asset);

    setCrop(result.uri);
    setIsCropping(false);
  }

  return (
    <View style={styles.root}>
      <Pressable onPress={rotate}>
        <Icon
          name={'format-rotate-90'}
          size={24}
          color={isRotated ? activeColor : baseColor}
        />
      </Pressable>

      <Pressable onPress={flipHorizontal}>
        <Icon
          name={'flip-horizontal'}
          size={24}
          color={isFlippedH ? activeColor : baseColor}
        />
      </Pressable>

      <Pressable onPress={flipVertical}>
        <Icon
          name={'flip-vertical'}
          size={24}
          color={isFlippedV ? activeColor : baseColor}
        />
      </Pressable>

      <Pressable style={styles.button} onPress={crop}>
        {isCropping ? (
          <ActivityIndicator size={'small'} color={baseColor} />
        ) : (
          <Icon name={'check'} size={24} color={'#fff'} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    gap: theme.spacing.l,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#75DAEA',
  },
});

export default Controls;
