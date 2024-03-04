import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('screen');
const center = { x: width / 2, y: height / 2 };

const radius = (width * 0.9) / 2;
const path = Skia.Path.MakeFromSVGString(
  `M 0 0 h ${width} v ${height} h ${-width} v ${-height} M ${
    center.x - radius
  } ${center.y} a 1 1 0 0 0 ${radius * 2} 0 a 1 1 0 0 0 ${-1 * radius * 2} 0`
)!;

export const cropSize = width * 0.9;

const CropOverlay: React.FC = ({}) => {
  return (
    <Canvas style={styles.root}>
      <Path path={path} color={'rgba(0, 0, 0, 0.4)'} />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default CropOverlay;
