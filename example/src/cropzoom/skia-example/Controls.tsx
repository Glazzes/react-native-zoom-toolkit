import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { withTiming, type SharedValue } from 'react-native-reanimated';
import {
  rect,
  type SkImage,
  Skia,
  FilterMode,
  MipmapMode,
} from '@shopify/react-native-skia';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system';
import type { CropZoomRefType } from 'react-native-zoom-toolkit';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import {
  baseColor,
  activeColor,
  buttonSize,
  indentity,
  blackAndWhite,
} from '../commons/contants';
import EffectPreview from './EffectPreview';
import { theme } from '../../constants';

type EffectIndicatorProps = {
  image: SkImage;
  progress: SharedValue<number>;
  cropRef: React.RefObject<CropZoomRefType>;
  setCrop: (uri: string | undefined) => void;
};

const matrices: number[][] = [indentity, blackAndWhite];

const Controls: React.FC<EffectIndicatorProps> = ({
  image,
  progress,
  cropRef,
  setCrop,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  function rotate() {
    cropRef?.current?.rotate(true, true, (angle) => {
      setIsRotated(angle !== 0);
    });
  }

  function flipCanvasVertical() {
    cropRef.current?.flipHorizontal(true, () => setIsFlipped((prev) => !prev));
  }

  /*
   * Draw the image at position 0 0, then translate it by the negative origin values of the crop
   * context, this ensure the image will be in frame
   */
  async function crop() {
    setIsCropping(true);

    const cropContext = cropRef.current?.crop();
    if (cropContext === undefined) {
      return;
    }

    const { flipHorizontal, flipVertical, rotationAngle } = cropContext.context;
    const { width, height, originX, originY } = cropContext.crop;

    const rotatedImage = drawImageRotated(
      image,
      rotationAngle,
      flipHorizontal,
      flipVertical
    );

    const surface = Skia.Surface.MakeOffscreen(width, height)!;
    const canvas = surface.getCanvas();

    const paint = Skia.Paint();
    const activeMatrix = progress.value === 0 ? indentity : blackAndWhite;
    paint.setColorFilter(Skia.ColorFilter.MakeMatrix(activeMatrix));

    canvas.translate(-1 * originX, -1 * originY);
    canvas.drawImageRectOptions(
      rotatedImage,
      rect(0, 0, rotatedImage.width(), rotatedImage.height()),
      rect(0, 0, rotatedImage.width(), rotatedImage.height()),
      FilterMode.Linear,
      MipmapMode.Linear,
      paint
    )!;

    const snapshot = surface.makeImageSnapshot();
    saveBase64ImageToDisk(snapshot.encodeToBase64());
  }

  function drawImageRotated(
    currentImage: SkImage,
    angle: number,
    flipH: boolean,
    flipV: boolean
  ): SkImage {
    const isInverted = angle === 90 || angle === 270;
    const width = isInverted ? image.height() : image.width();
    const height = isInverted ? image.width() : image.height();

    const surface = Skia.Surface.MakeOffscreen(width, height)!;
    const canvas = surface.getCanvas();

    canvas.translate(width / 2, height / 2);
    canvas.rotate(angle, 0, 0);
    canvas.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const x = -1 * (width / 2) + (width - currentImage.width()) / 2;
    const y = -1 * (height / 2) + (height - currentImage.height()) / 2;

    canvas.drawImageRectOptions(
      currentImage,
      rect(0, 0, currentImage.width(), currentImage.height()),
      rect(x, y, currentImage.width(), currentImage.height()),
      FilterMode.Linear,
      MipmapMode.Linear
    );

    return surface.makeImageSnapshot();
  }

  async function saveBase64ImageToDisk(base64: string) {
    const time = new Date().getTime();
    const fileUri = `${cacheDirectory}picture${time}.png`;

    writeAsStringAsync(fileUri, base64, { encoding: 'base64' })
      .then(() => {
        setCrop(fileUri);
      })
      .finally(() => {
        setIsCropping(false);
      });
  }

  useEffect(() => {
    progress.value = withTiming(activeIndex);
  }, [activeIndex, progress]);

  return (
    <View style={styles.root}>
      <View style={styles.previewContainer}>
        {matrices.map((matrix, index) => {
          return (
            <EffectPreview
              key={`matrix-${index}`}
              index={index}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              image={image}
              matrix={matrix}
            />
          );
        })}
      </View>

      <Pressable onPress={rotate}>
        <Icon
          name={'format-rotate-90'}
          size={24}
          color={isRotated ? activeColor : baseColor}
        />
      </Pressable>

      <Pressable onPress={flipCanvasVertical}>
        <Icon
          name={'flip-horizontal'}
          size={24}
          color={isFlipped ? activeColor : baseColor}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    gap: theme.spacing.l,
    zIndex: 100,
  },
  previewContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  button: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#75DAEA',
  },
});

export default Controls;
