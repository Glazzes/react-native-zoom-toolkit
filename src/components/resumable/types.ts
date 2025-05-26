import type React from 'react';
import type { ViewStyle } from 'react-native';

import type {
  CommonResumableProps,
  CommonTransformState,
  CommonZoomState,
  LongPressCallbacks,
  PanGestureCallbacks,
  PinchCenteringMode,
  PinchGestureCallbacks,
  Rect,
  SizeVector,
  SwipeDirection,
  TapGestureCallbacks,
  Vector,
} from '../../commons/types';

export type ResumableZoomTransformState = Omit<
  CommonZoomState<number>,
  'width' | 'height'
>;

export type ResumableZoomProps = Partial<{
  style: ViewStyle;
  decay: boolean;
  extendGestures: boolean;
  tapsEnabled: boolean;
  panEnabled: boolean;
  pinchEnabled: boolean;
  maxScale: SizeVector<number> | number;
  pinchCenteringMode: PinchCenteringMode;
  longPressDuration: number;
  onSwipe: (direction: SwipeDirection) => void;
  onUpdate: (e: ResumableZoomState<number, SizeVector<number>>) => void;
  onOverPanning: (x: number, y: number) => void;
}> & { children: React.ReactNode } & PanGestureCallbacks &
  PinchGestureCallbacks &
  LongPressCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonResumableProps, 'maxScale'>;

export type ResumableZoomState<T, S> = {
  containerSize: S;
  childSize: S;
  maxScale: T;
} & CommonTransformState<T>;

export interface ResumableZoomRefType {
  reset: (animate?: boolean) => void;
  getState: () => ResumableZoomState<number, SizeVector<number>>;
  setTransformState: (
    state: ResumableZoomTransformState,
    animate?: boolean
  ) => void;
  zoom: (newScale: number, position?: Vector<number>) => void;
  getVisibleRect: () => Rect;
}
