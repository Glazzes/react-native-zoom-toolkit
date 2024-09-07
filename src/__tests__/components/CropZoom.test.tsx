import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';

import CropZoom from '../../components/crop/CropZoom';
import type { SizeVector } from '../../commons/types';

const cropSize: SizeVector<number> = { width: 100, height: 100 };
const resolution: SizeVector<number> = { width: 100, height: 200 };

describe('CropZoom Property Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should render properly in managed mode when one children is passed', () => {
    expect(() =>
      render(
        <CropZoom cropSize={cropSize} resolution={resolution}>
          <View />
        </CropZoom>
      )
    ).toBeDefined();
  });

  test('should throw error if minScale property is less than one', () => {
    const cropzoom = (
      <CropZoom cropSize={cropSize} resolution={resolution} minScale={-1} />
    );

    expect(() => render(cropzoom)).toThrow();
  });

  test('should throw error if maxScale property is in zero to one range', () => {
    const random = Math.random();

    const cropzoom = (
      <CropZoom cropSize={cropSize} resolution={resolution} maxScale={random} />
    );

    expect(() => render(cropzoom)).toThrow();
  });

  test('should throw error if minScale property is greater than maxScale', () => {
    const cropzoom = (
      <CropZoom
        cropSize={cropSize}
        resolution={resolution}
        minScale={10}
        maxScale={5}
      />
    );

    expect(() => render(cropzoom)).toThrow();
  });
});
