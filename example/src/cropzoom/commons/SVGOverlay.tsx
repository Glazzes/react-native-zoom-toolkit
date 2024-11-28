import React, { useMemo } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { CONTROLS_HEIGHT } from './contants';

import type { SizeVector } from 'react-native-zoom-toolkit';

type SVGOverlayProps = {
  cropSize: SizeVector<number>;
};

/*
 * Draws an SVG as big as the space cropzoom is ocuppying in the screen, this
 * one also draws a "hole" in it as big as the crop size.
 */
const SVGOverlay: React.FC<SVGOverlayProps> = ({ cropSize }) => {
  const { width, height } = useWindowDimensions();

  const path = useMemo(() => {
    const center = { x: width / 2, y: (height - CONTROLS_HEIGHT) / 2 };
    const commands = [
      'M 0 0',
      `h ${width} v ${height}`,
      `h ${-width} v ${-height}`,
      `M ${center.x - cropSize.width / 2} ${center.y}`,
      `a 1 1 0 0 0 ${cropSize.width} 0`,
      `a 1 1 0 0 0 ${-1 * cropSize.height} 0`,
    ].join(' ');

    return Skia.Path.MakeFromSVGString(commands)!;
  }, [width, height, cropSize]);

  const style: ViewStyle = {
    width,
    height: height - CONTROLS_HEIGHT,
  };

  return (
    <Canvas style={style}>
      <Path path={path} color={'rgba(0, 0, 0, 0.4)'} fillType={'evenOdd'} />
    </Canvas>
  );
};

export default SVGOverlay;
