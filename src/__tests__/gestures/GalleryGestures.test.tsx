import React from 'react';
import { View } from 'react-native';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import {
  State,
  type LongPressGesture,
  type PanGesture,
  type PinchGesture,
  type TapGesture,
} from 'react-native-gesture-handler';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Gallery } from '../../index';
import type { Size, Vector } from '../../commons/types';
import type {
  GalleryProps,
  GalleryRefType,
} from '../../components/gallery/types';

type GalleryPropsWithRef = GalleryProps<number> & {
  ref?: React.ForwardedRef<GalleryRefType>;
};

describe('Gallery Gesture Tests', () => {
  beforeAll(() => {
    jest.useFakeTimers({ advanceTimers: true });
  });

  const renderGallery = (
    props: Omit<GalleryPropsWithRef, 'data' | 'renderItem'>
  ) => {
    const rootResolution: Size<number> = { width: 100, height: 600 };
    const childResolution: Size<number> = { width: 100, height: 100 };
    const data: number[] = [1, 2];
    render(
      <Gallery
        {...props}
        data={data}
        renderItem={() => {
          return <View style={{ ...childResolution }} />;
        }}
      />
    );

    fireEvent(screen.getByTestId('root'), 'layout', {
      nativeEvent: { layout: { ...rootResolution } },
    });
    for (let i = 0; i < data.length; i++) {
      fireEvent(screen.getByTestId(`child-${i}`), 'layout', {
        nativeEvent: { layout: { ...childResolution } },
      });
    }
    jest.runAllTimers();
  };

  const panToNextItem = (vertical: boolean, distance: number, velocity = 0) => {
    const start = { absoluteX: 50, absoluteY: 300 };
    const translation = vertical
      ? { translationY: -distance, velocityY: -velocity }
      : { translationX: -distance, velocityX: -velocity };
    const end = vertical
      ? { absoluteX: 50, absoluteY: start.absoluteY - distance }
      : { absoluteX: start.absoluteX - distance, absoluteY: 300 };

    fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
      { state: State.BEGAN, ...start },
      { state: State.ACTIVE, ...start },
      { state: State.ACTIVE, ...end, ...translation },
      { state: State.END, ...end, ...translation },
    ]);
    jest.runAllTimers();
  };

  it('should trigger gesture callbacks', () => {
    const onPanStart = jest.fn();
    const onPanEnd = jest.fn();
    const onLongPress = jest.fn();
    const onGestureEnd = jest.fn();

    renderGallery({ onPanStart, onPanEnd, onLongPress, onGestureEnd });

    fireGestureHandler<PanGesture>(getByGestureTestId('pan'));
    fireGestureHandler<TapGesture>(getByGestureTestId('tap'));
    fireGestureHandler<LongPressGesture>(getByGestureTestId('longPress'));

    jest.runAllTimers();

    expect(onPanStart).toHaveReturnedTimes(1);
    expect(onPanEnd).toHaveReturnedTimes(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onGestureEnd).toHaveReturnedTimes(1);
  });

  type TapData = {
    title: string;
    coordinates: Vector<number>;
    timesCalled: number;
  };

  it.each<TapData>([
    {
      title: 'should trigger tap gesture when in bounds',
      coordinates: { x: 50, y: 50 },
      timesCalled: 1,
    },
    {
      title: 'should not trigger tap gesture when in tapOnEdgeItem bounds',
      coordinates: { x: 80, y: 50 },
      timesCalled: 0,
    },
  ])('$title', ({ coordinates, timesCalled }) => {
    const onTap = jest.fn();
    renderGallery({ onTap });

    fireGestureHandler<TapGesture>(getByGestureTestId('tap'), [
      { state: State.ACTIVE, ...coordinates },
    ]);
    jest.runAllTimers();

    expect(onTap).toHaveReturnedTimes(timesCalled);
  });

  type ZoomData = {
    title: string;
    enabled: boolean;
    timesCalled: number;
    expectedScale: number;
  };

  it.each<ZoomData>([
    {
      title: 'should trigger zoom when enabled',
      enabled: true,
      timesCalled: 1,
      expectedScale: 6,
    },
    {
      title: 'should not trigger zoom when disabled',
      enabled: false,
      timesCalled: 0,
      expectedScale: 1,
    },
  ])('$title', ({ enabled, timesCalled, expectedScale }) => {
    const ref = React.createRef<GalleryRefType>();
    const onPinchStart = jest.fn();
    const onPinchEnd = jest.fn();
    const onGestureEnd = jest.fn();

    renderGallery({
      ref,
      onPinchStart,
      onPinchEnd,
      onGestureEnd,
      zoomEnabled: enabled,
    });

    act(() => {
      fireGestureHandler<PinchGesture>(getByGestureTestId('pinch'), [
        { state: State.ACTIVE, scale: 2 },
      ]);
      fireGestureHandler<TapGesture>(getByGestureTestId('doubleTap'));
      jest.runAllTimers();
    });

    expect(onPinchStart).toHaveBeenCalledTimes(timesCalled);
    expect(onPinchEnd).toHaveBeenCalledTimes(timesCalled);
    expect(onGestureEnd).toHaveBeenCalledTimes(timesCalled * 2);
    expect(ref.current?.getState().scale).toBe(expectedScale);
  });

  it.each([
    {
      title: 'changes horizontal pages at a custom snap threshold',
      vertical: false,
      distance: 20,
    },
    {
      title: 'changes vertical pages at a custom snap threshold',
      vertical: true,
      distance: 120,
    },
  ])('$title', ({ vertical, distance }) => {
    const onIndexChange = jest.fn();
    renderGallery({ vertical, snapThreshold: 0.2, onIndexChange });

    panToNextItem(vertical, distance);

    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it('keeps the default halfway snap threshold', () => {
    const onIndexChange = jest.fn();
    renderGallery({ onIndexChange });

    panToNextItem(false, 49);

    expect(onIndexChange).not.toHaveBeenCalledWith(1);

    panToNextItem(false, 51);

    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it('changes pages at a custom swipe velocity threshold', () => {
    const onIndexChange = jest.fn();
    renderGallery({
      vertical: true,
      snapThreshold: 0.9,
      swipeVelocityThreshold: 200,
      onIndexChange,
    });

    panToNextItem(true, 30, 250);

    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it('changes pages at a custom swipe distance threshold', () => {
    const onIndexChange = jest.fn();
    renderGallery({
      vertical: true,
      snapThreshold: 0.9,
      swipeDistanceThreshold: 10,
      onIndexChange,
    });

    panToNextItem(true, 10, 500);

    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });
});
