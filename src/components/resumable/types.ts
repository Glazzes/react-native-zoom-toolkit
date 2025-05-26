import type React from 'react';
import type { ViewStyle } from 'react-native';

import type {
  CommonResumableProps,
  CommonTransformState,
  CommonZoomState,
  LongPressCallbacks,
  PanGestureCallbacks,
  PinchMode,
  PinchGestureCallbacks,
  Rect,
  SizeVector,
  SwipeDirection,
  TapGestureCallbacks,
  Vector,
} from '../../commons/types';

export type ResumableZoomProps = Partial<{
  style: ViewStyle;
  decay: boolean;
  extendGestures: boolean;
  tapsEnabled: boolean;
  panEnabled: boolean;
  pinchEnabled: boolean;
  maxScale: SizeVector<number> | number;
  pinchMode: PinchMode;
  longPressDuration: number;
  onSwipe: (direction: SwipeDirection) => void;
  onUpdate: (e: CommonZoomState<number>) => void;
  onOverPanning: (x: number, y: number) => void;
}> & { children: React.ReactNode } & PanGestureCallbacks &
  PinchGestureCallbacks &
  LongPressCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonResumableProps, 'maxScale'>;

export interface ResumableZoomRefType {
  reset: (animate?: boolean) => void;
  getState: () => CommonZoomState<number>;
  setTransformState: (
    state: CommonTransformState<number>,
    animate?: boolean
  ) => void;
  zoom: (newScale: number, position?: Vector<number>) => void;
  getVisibleRect: () => Rect;
}
