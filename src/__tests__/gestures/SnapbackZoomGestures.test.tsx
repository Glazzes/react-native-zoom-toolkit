import React from 'react';
import { View } from 'react-native';
import {
  type LongPressGesture,
  type PinchGesture,
  type TapGesture,
} from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { render } from '@testing-library/react-native';

import SnapbackZoom from '../../components/snapback/SnapbackZoom';

describe('SnapbackZoom Gesture Tests', () => {
  beforeAll(() => {
    jest.useFakeTimers({ advanceTimers: true });
  });

  type GestureCallbackData = {
    title: string;
    enabled: boolean;
    timesCalled: number;
  };

  it.each<GestureCallbackData>([
    {
      title: 'should trigger gesture callbacks when enabled',
      enabled: true,
      timesCalled: 1,
    },
    {
      title: 'should not trigger gesture callbacks when disabled',
      enabled: false,
      timesCalled: 0,
    },
  ])('$title', ({ enabled, timesCalled }) => {
    const onPinchStart = jest.fn();
    const onPinchEnd = jest.fn();
    const onTap = jest.fn();
    const onDoubleTap = jest.fn();
    const onLongPress = jest.fn();
    const onGestureEnd = jest.fn();

    render(
      <SnapbackZoom
        onPinchStart={onPinchStart}
        onPinchEnd={onPinchEnd}
        onTap={onTap}
        onDoubleTap={onDoubleTap}
        onGestureEnd={onGestureEnd}
        onLongPress={onLongPress}
        gesturesEnabled={enabled}
      >
        <View />
      </SnapbackZoom>
    );

    fireGestureHandler<PinchGesture>(getByGestureTestId('pinch'));
    fireGestureHandler<TapGesture>(getByGestureTestId('tap'));
    fireGestureHandler<TapGesture>(getByGestureTestId('doubleTap'));
    fireGestureHandler<LongPressGesture>(getByGestureTestId('longPress'));

    jest.runAllTimers();

    expect(onPinchStart).toHaveBeenCalledTimes(timesCalled);
    expect(onPinchEnd).toHaveBeenCalledTimes(timesCalled);
    expect(onTap).toHaveBeenCalledTimes(timesCalled);
    expect(onDoubleTap).toHaveBeenCalledTimes(timesCalled);
    expect(onLongPress).toHaveBeenCalledTimes(timesCalled);
    expect(onGestureEnd).toHaveBeenCalledTimes(timesCalled);
  });
});
