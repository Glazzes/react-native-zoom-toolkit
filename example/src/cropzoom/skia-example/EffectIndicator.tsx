import React, { useState } from 'react';
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
  Canvas,
  type SkImage,
  Image,
  ColorMatrix,
} from '@shopify/react-native-skia';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system';
import { cropSize } from '../commons/CropOverlay';
import { withTiming, type SharedValue } from 'react-native-reanimated';

type EffectIndicatorProps = {
  progress: SharedValue<number>;
  image: SkImage;
  setCrop: (uri: string | undefined) => void;
  cropRef: React.RefObject<CropZoomType>;
  canvasRef: React.RefObject<SkiaDomView>;
};

const baseColor = '#fff';
const activeColor = '#75DAEA';

const BUTTON_SIZE = 50;
const blackAndWhite = [
  0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
];

const EffectIndicator: React.FC<EffectIndicatorProps> = ({
  image,
  progress,
  cropRef,
  canvasRef,
  setCrop,
}) => {
  const { width, height } = useWindowDimensions();

  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [rotated, setRotated] = useState<number>(0);

  const rotate = () => {
    cropRef?.current?.rotate();
    setRotated((prev) => {
      if (prev + 1 === 4) {
        return 0;
      }

      return prev + 1;
    });
  };

  const desaturate = () => (progress.value = withTiming(1));
  const saturate = () => (progress.value = withTiming(0));

  const cropCanvas = async () => {
    setIsCropping(true);

    const canvasCrop = rect(
      (width - cropSize) / 2,
      (height - cropSize) / 2,
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

  return (
    <View style={styles.root}>
      <View style={styles.previewContainer}>
        <Pressable onPress={saturate} style={styles.pressable}>
          <Canvas style={styles.canvas}>
            <Image
              image={image}
              x={0}
              y={0}
              width={BUTTON_SIZE}
              height={BUTTON_SIZE}
              fit={'cover'}
            />
          </Canvas>
        </Pressable>

        <Pressable onPress={desaturate} style={styles.pressable}>
          <Canvas style={styles.canvas}>
            <Image
              image={image}
              x={0}
              y={0}
              width={BUTTON_SIZE}
              height={BUTTON_SIZE}
              fit={'cover'}
            >
              <ColorMatrix matrix={blackAndWhite} />
            </Image>
          </Canvas>
        </Pressable>
      </View>

      <Pressable onPress={rotate}>
        <Icon
          name={'format-rotate-90'}
          size={24}
          color={rotated === 0 ? baseColor : activeColor}
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    gap: theme.spacing.l,
    position: 'absolute',
    bottom: 0,
    zIndex: 100,
  },
  previewContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  pressable: {
    borderWidth: 1,
    borderRadius: theme.spacing.s,
    borderColor: baseColor,
    overflow: 'hidden',
  },
  canvas: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#75DAEA',
  },
});

export default EffectIndicator;
