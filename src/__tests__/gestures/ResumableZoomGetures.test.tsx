import React from 'react';
import { View } from 'react-native';
import { makeMutable } from 'react-native-reanimated';
import {
  State,
  type PanGesture,
  type PinchGesture,
  type TapGesture,
  type LongPressGesture,
} from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import ResumableZoom from '../../components/resumable/ResumableZoom';
import type {
  ResumableZoomProps,
  ResumableZoomType,
} from '../../components/resumable/types';
import type { PanMode, SizeVector } from '../../commons/types';

type ResumableZoomPropsWithRef = ResumableZoomProps & {
  ref?: React.ForwardedRef<ResumableZoomType>;
};

describe('ResumableZoom Gesture Tests', () => {
  const resolution: SizeVector<number> = { width: 600, height: 600 };
  const rootResolution: SizeVector<number> = { width: 100, height: 600 };
  const childResolution: SizeVector<number> = { width: 100, height: 100 };

  const renderResumableZoom = (props: ResumableZoomPropsWithRef) => {
    render(<ResumableZoom {...props}>{props.children}</ResumableZoom>);

    fireEvent(screen.getByTestId('root'), 'layout', {
      nativeEvent: { layout: { ...rootResolution } },
    });
    fireEvent(screen.getByTestId('child'), 'layout', {
      nativeEvent: { layout: { ...childResolution } },
    });
    jest.runAllTimers();
  };

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
      title: 'should trigger gesture callbacks when gestures are enabled',
      enabled: true,
      timesCalled: 1,
    },
    {
      title: 'should not trigger gesture callbacks when gestures are disabled',
      enabled: false,
      timesCalled: 0,
    },
  ])('$title', ({ enabled, timesCalled }) => {
    const onPanStart = jest.fn();
    const onPanEnd = jest.fn();
    const onPinchEnd = jest.fn();
    const onPinchStart = jest.fn();
    const onLongPress = jest.fn();
    const onTap = jest.fn();
    const onGestureEnd = jest.fn();

    renderResumableZoom({
      onPanStart,
      onPanEnd,
      onPinchStart,
      onPinchEnd,
      onLongPress,
      onTap,
      onGestureEnd,
      panEnabled: enabled,
      tapsEnabled: enabled,
      pinchEnabled: enabled,
      children: <View style={{ ...childResolution }} />,
    });

    act(() => {
      fireGestureHandler<PanGesture>(getByGestureTestId('pan'));
      fireGestureHandler<PinchGesture>(getByGestureTestId('pinch'));
      fireGestureHandler<TapGesture>(getByGestureTestId('tap'));
      fireGestureHandler<TapGesture>(getByGestureTestId('doubleTap'));
      fireGestureHandler<LongPressGesture>(getByGestureTestId('longPress'));

      jest.runAllTimers();
    });

    expect(onPinchStart).toHaveBeenCalledTimes(timesCalled);
    expect(onPinchEnd).toHaveBeenCalledTimes(timesCalled);
    expect(onPanStart).toHaveBeenCalledTimes(timesCalled);
    expect(onPanEnd).toHaveBeenCalledTimes(timesCalled);
    expect(onTap).toHaveBeenCalledTimes(timesCalled);
    expect(onGestureEnd).toHaveBeenCalledTimes(timesCalled * 3);

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  /*
   * This test is aplicable to ResuambleZoom, CropZoom and Gallery components, if this test fails
   * it means the implementation fails for all these componenets.
   *
   * I placed this test here, becuase ResumableZoom is the heart of this library.
   */
  it('should disable all other gestures when pinch starts', async () => {
    renderResumableZoom({ children: <View style={{ ...childResolution }} /> });

    act(() => {
      fireGestureHandler<PinchGesture>(getByGestureTestId('pinch'), [
        { state: State.BEGAN },
        { state: State.UNDETERMINED },
      ]);

      jest.runAllTimers();
    });

    const pan = getByGestureTestId('pan');
    const tap = getByGestureTestId('tap');
    const doubleTap = getByGestureTestId('doubleTap');
    const longPress = getByGestureTestId('longPress');

    await waitFor(() => expect(pan.config.enabled).toBe(false));
    await waitFor(() => expect(tap.config.enabled).toBe(false));
    await waitFor(() => expect(doubleTap.config.enabled).toBe(false));
    await waitFor(() => expect(longPress.config.enabled).toBe(false));
  });

  /*
   * This test is applicable to ResuambleZoom and Gallery components, if this test fails
   * it means the implementation fails for these two componenets.
   *
   * I placed this test here, becuase ResumableZoom is the heart of this library.
   */
  it('should scale to maxScale on double tap and viceversa', () => {
    const ref = React.createRef<ResumableZoomType>();
    renderResumableZoom({
      ref,
      maxScale: resolution,
      children: <View style={{ ...childResolution }} />,
    });

    const doubleTap = getByGestureTestId('doubleTap');
    fireGestureHandler<TapGesture>(doubleTap);
    jest.runAllTimers();

    expect(ref.current?.requestState().scale).toBe(6);

    fireGestureHandler<TapGesture>(doubleTap);
    jest.runAllTimers();

    expect(ref.current?.requestState().scale).toBe(1);
  });

  it('should trigger onOverPanning callback', () => {
    const shared = makeMutable(0);
    const onOverPanning = () => {
      'worklet';
      shared.value += 1;
    };

    renderResumableZoom({
      maxScale: resolution,
      onOverPanning,
      children: <View style={{ ...childResolution }} />,
    });

    act(() => {
      fireGestureHandler<PinchGesture>(getByGestureTestId('pinch'), [
        { state: State.ACTIVE, scale: 2 },
      ]);
      fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
        { state: State.ACTIVE, translationX: 50 },
        { state: State.ACTIVE, translationX: 100 },
        { state: State.ACTIVE, translationX: 150 },
      ]);
      jest.runAllTimers();
    });

    expect(shared.value).toBe(2);
  });

  type PanModeDataset = {
    title: string;
    panMode: PanMode;
    boundary: number;
  };

  it.each<PanModeDataset>([
    {
      title: 'should stay clamped when panMode is set to clamp',
      panMode: 'clamp',
      boundary: 50,
    },
    {
      title:
        'should be equals to translationX value when panMode is set to free',
      panMode: 'free',
      boundary: 150,
    },
  ])('$title', async ({ panMode, boundary }) => {
    const ref = React.createRef<ResumableZoomType>();

    renderResumableZoom({
      ref,
      panMode,
      children: <View style={{ ...childResolution }} />,
    });

    act(() => {
      fireGestureHandler<PinchGesture>(getByGestureTestId('pinch'), [
        {
          state: State.BEGAN,
          focalX: childResolution.width / 2,
          focalY: childResolution.height / 2,
        },
        { state: State.ACTIVE, scale: 2 },
        { state: State.UNDETERMINED },
      ]);

      fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
        { state: State.BEGAN },
        { state: State.ACTIVE, translationX: 50 },
        { state: State.ACTIVE, translationX: 100 },
        { state: State.ACTIVE, translationX: 150 },
        { state: State.UNDETERMINED },
      ]);

      jest.runAllTimers();
    });

    expect(ref.current?.requestState().translateX).toBe(boundary);
  });
});
