import React from 'react';
import { View } from 'react-native';
import CropZoom from '../../components/crop/CropZoom';
import { CropMode } from '../../components/crop/types';
import { render } from '@testing-library/react-native';
import type { SizeVector } from '../../commons/types';
import { getInvalidChildrenMessage } from '../../commons/utils/messages';
import { getInvalidCropSizeMessage } from '../../components/crop/utils/messages';

const componentName = 'CropZoom';
const cropSize: SizeVector<number> = { width: 100, height: 100 };
const resolution: SizeVector<number> = { width: 100, height: 200 };

describe('CropZoom', () => {
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

  test('should throw error in managed mode when no child is passed', () => {
    const message = getInvalidChildrenMessage({
      name: componentName,
      expected: 1,
      actual: 0,
    });

    expect(() =>
      render(
        <CropZoom
          mode={CropMode.MANAGED}
          cropSize={cropSize}
          resolution={resolution}
        />
      )
    ).toThrow(message);
  });

  test('should render properly in overlay mode when no children are passed', () => {
    expect(
      render(
        <CropZoom
          cropSize={cropSize}
          resolution={resolution}
          mode={CropMode.OVERLAY}
        />
      )
    ).toBeDefined();
  });

  test('should throw error in overlay mode when children are passed', () => {
    const message = getInvalidChildrenMessage({
      name: componentName,
      expected: 0,
      actual: 1,
    });

    expect(() =>
      render(
        <CropZoom
          cropSize={cropSize}
          resolution={resolution}
          mode={CropMode.OVERLAY}
        >
          <View />
        </CropZoom>
      )
    ).toThrow(message);
  });

  test('should throw error if minScale property is less than one', () => {
    const cropzoom = (
      <CropZoom
        cropSize={cropSize}
        resolution={resolution}
        mode={CropMode.OVERLAY}
        minScale={-1}
      />
    );

    expect(() => render(cropzoom)).toThrow();
  });

  test('should throw error if maxScale property is in zero to one range', () => {
    const random = Math.random();

    const cropzoom = (
      <CropZoom
        cropSize={cropSize}
        resolution={resolution}
        mode={CropMode.OVERLAY}
        maxScale={random}
      />
    );

    expect(() => render(cropzoom)).toThrow();
  });

  test('should throw error if minScale property is greater than maxScale', () => {
    const cropzoom = (
      <CropZoom
        cropSize={cropSize}
        resolution={resolution}
        mode={CropMode.OVERLAY}
        minScale={10}
        maxScale={5}
      />
    );

    expect(() => render(cropzoom)).toThrow();
  });

  test('should warn the user about invalid crop size height', () => {
    const exceededCropSize: SizeVector<number> = { width: 100, height: 400 };
    const spyConsole = jest.spyOn(global.console, 'warn');

    const message = getInvalidCropSizeMessage({
      dimension: 'height',
      actual: exceededCropSize.height,
      expected: resolution.height,
    });

    expect(
      render(
        <CropZoom cropSize={exceededCropSize} resolution={resolution}>
          <View />
        </CropZoom>
      )
    ).toBeDefined();

    expect(spyConsole).toBeCalledWith(message);
  });

  test('should warn the user about invalid crop size width', () => {
    const horizontalResolution: SizeVector<number> = {
      width: 200,
      height: 100,
    };
    const exceededCropSize: SizeVector<number> = { width: 400, height: 100 };

    const spyConsole = jest.spyOn(global.console, 'warn');
    const message = getInvalidCropSizeMessage({
      dimension: 'width',
      actual: exceededCropSize.width,
      expected: horizontalResolution.width,
    });

    expect(
      render(
        <CropZoom cropSize={exceededCropSize} resolution={horizontalResolution}>
          <View />
        </CropZoom>
      )
    ).toBeDefined();

    expect(spyConsole).toBeCalledWith(message);
  });
});
