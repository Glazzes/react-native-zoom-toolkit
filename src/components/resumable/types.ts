import type React from 'react';
import type { ViewStyle } from 'react-native';

import type {
  CommonResumableProps,
  CommonZoomState,
  PanGestureCallbacks,
  PinchCenteringMode,
  PinchGestureCallbacks,
  Rect,
  SizeVector,
  SwipeDirection,
  TapGestureCallbacks,
  Vector,
} from '../../commons/types';

export type ResumableZoomAssignableState = Omit<
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
  onSwipe: (direction: SwipeDirection) => void;
  onUpdate: (e: CommonZoomState<number>) => void;
  onOverPanning: (x: number, y: number) => void;
}> & { children: React.ReactNode } & PanGestureCallbacks &
  PinchGestureCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonResumableProps, 'maxScale'>;

export type ResumableZoomType = {
  reset: (animate?: boolean) => void;
  requestState: () => CommonZoomState<number>;
  assignState: (state: ResumableZoomAssignableState, animate?: boolean) => void;
  zoom: (accScale: number, xy?: Vector<number>) => void;
  getVisibleRect: () => Rect;
};
