import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import {
  Canvas,
  ColorMatrix,
  Image,
  type SkImage,
} from '@shopify/react-native-skia';
import {
  buttonSize,
  activeColor,
  baseColor,
  borderWidth,
} from '../commons/contants';
import { theme } from '../../constants';

type EffectPreviewProps = {
  index: number;
  activeIndex: number;
  setActiveIndex: (value: number) => void;
  image: SkImage;
  matrix: number[];
};

/*
 * Renders a preview image with the color matrix applied to it.
 * On tap updates the color matrix of the full size image.
 */
const EffectPreview: React.FC<EffectPreviewProps> = ({
  index,
  activeIndex,
  setActiveIndex,
  image,
  matrix,
}) => {
  const activeStyle: ViewStyle = {
    borderColor: activeIndex === index ? activeColor : baseColor,
  };

  function updateActiveIndex() {
    setActiveIndex(index);
  }

  return (
    <Pressable
      onPress={updateActiveIndex}
      style={[styles.pressable, activeStyle]}
    >
      <Canvas style={styles.canvas}>
        <Image
          image={image}
          x={0}
          y={0}
          width={buttonSize}
          height={buttonSize}
          fit={'cover'}
        >
          <ColorMatrix matrix={matrix} />
        </Image>
      </Canvas>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: buttonSize - borderWidth * 2,
    height: buttonSize - borderWidth * 2,
  },
  pressable: {
    borderWidth: borderWidth,
    borderRadius: theme.spacing.s,
    overflow: 'hidden',
  },
});

export default EffectPreview;
