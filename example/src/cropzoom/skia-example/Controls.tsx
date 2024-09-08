import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import type { CropZoomType } from '../../../../src/components/crop/types';
import { theme } from '../../constants';
import {
  rect,
  ImageFormat,
  type SkiaDomView,
  type SkImage,
} from '@shopify/react-native-skia';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system';
import { withTiming, type SharedValue } from 'react-native-reanimated';
import {
  baseColor,
  activeColor,
  buttonSize,
  indentity,
  blackAndWhite,
  CONTROLS_HEIGHT,
} from '../commons/contants';
import EffectPreview from './EffectPreview';

type EffectIndicatorProps = {
  cropSize: number;
  progress: SharedValue<number>;
  image: SkImage;
  setCrop: (uri: string | undefined) => void;
  cropRef: React.RefObject<CropZoomType>;
  canvasRef: React.RefObject<SkiaDomView>;
};

const matrices: number[][] = [indentity, blackAndWhite];

const Controls: React.FC<EffectIndicatorProps> = ({
  cropSize,
  image,
  progress,
  cropRef,
  canvasRef,
  setCrop,
}) => {
  const { width, height } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const rotate = () => {
    cropRef?.current?.rotate(true, true, (angle) => {
      setIsRotated(angle !== 0);
    });
  };

  const flipVertical = () => {
    cropRef.current?.flipHorizontal(true, () => setIsFlipped((prev) => !prev));
  };

  /*
   * In contast to image files where we use crop method from cropZoom here, it does not make any
   * sense to use it here, as we do not have access to a file, we just take a snapshot of the canvas
   * where our crop size is located at, starting  from the posiiton in the top left corner
   */
  const cropCanvas = async () => {
    setIsCropping(true);

    const canvasCrop = rect(
      (width - cropSize) / 2,
      (height - CONTROLS_HEIGHT - cropSize) / 2,
      cropSize,
      cropSize
    );
    const canvasSnapshot = canvasRef.current?.makeImageSnapshot(canvasCrop);

    if (canvasSnapshot !== undefined) {
      const contents = canvasSnapshot.encodeToBase64(ImageFormat.PNG, 100);
      const time = new Date().getTime();
      const fileUri = `${cacheDirectory}picture${time}.png`;

      writeAsStringAsync(fileUri, contents, { encoding: 'base64' }).then(() => {
        setIsCropping(false);
        setCrop(fileUri);
      });
    }
  };

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

      <Pressable onPress={flipVertical}>
        <Icon
          name={'flip-horizontal'}
          size={24}
          color={isFlipped ? activeColor : baseColor}
        />
      </Pressable>

      <Pressable style={styles.button} onPress={cropCanvas}>
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
