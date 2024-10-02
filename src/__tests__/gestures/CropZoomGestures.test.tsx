import React from 'react';
import type {
  PanGesture,
  PinchGesture,
  TapGesture,
} from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { act, render } from '@testing-library/react-native';

import CropZoom from '../../components/crop/CropZoom';
import type { SizeVector } from '../../commons/types';
import type { CropZoomProps, CropZoomType } from '../../components/crop/types';

type CropZoomPropsWithRef = CropZoomProps & {
  ref?: React.ForwardedRef<CropZoomType>;
};

describe('CropZoom Gesture Tests', () => {
  beforeAll(() => {
    jest.useFakeTimers({ advanceTimers: true });
  });

  const renderCropZoom = (
    props: Omit<CropZoomPropsWithRef, 'cropSize' | 'resolution'>
  ) => {
    const cropSize: SizeVector<number> = { width: 100, height: 100 };
    const resolution: SizeVector<number> = { width: 600, height: 600 };

    render(<CropZoom {...props} cropSize={cropSize} resolution={resolution} />);
  };

  it('should trigger gesture callbacks', () => {
    const onPanStart = jest.fn();
    const onPanEnd = jest.fn();
    const onPinchEnd = jest.fn();
    const onPinchStart = jest.fn();
    const onTap = jest.fn();
    const onGestureEnd = jest.fn();

    renderCropZoom({
      onPanStart,
      onPanEnd,
      onPinchStart,
      onPinchEnd,
      onTap,
      onGestureEnd,
    });

    act(() => {
      fireGestureHandler<PanGesture>(getByGestureTestId('pan'));
      fireGestureHandler<TapGesture>(getByGestureTestId('tap'));
      fireGestureHandler<PinchGesture>(getByGestureTestId('pinch'));

      jest.runAllTimers();
    });

    expect(onPinchStart).toHaveBeenCalledTimes(1);
    expect(onPinchEnd).toHaveBeenCalledTimes(1);
    expect(onPanStart).toHaveBeenCalledTimes(1);
    expect(onPanEnd).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onGestureEnd).toHaveBeenCalledTimes(2);
  });
});
