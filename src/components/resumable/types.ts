import type React from 'react';
import type {
  CommonResumableProps,
  CommonZoomState,
  PanGestureCallbacks,
  PinchCenteringMode,
  PinchGestureCallbacks,
  SizeVector,
  SwipeDirection,
  TapGestureCallbacks,
} from '../../commons/types';

export type ResumableZoomAssignableState = Omit<
  CommonZoomState<number>,
  'width' | 'height'
>;

export type ResumableZoomProps = React.PropsWithChildren<{
  decay?: boolean;
  extendGestures?: boolean;
  tapsEnabled?: boolean;
  panEnabled?: boolean;
  pinchEnabled?: boolean;
  maxScale?: SizeVector<number> | number;
  pinchCenteringMode?: PinchCenteringMode;
  onSwipe?: (direction: SwipeDirection) => void;
  onGestureActive?: (e: CommonZoomState<number>) => void;
  onGestureEnd?: (() => void) | undefined;
  onOverPanning?: (x: number, y: number) => void;
}> &
  PanGestureCallbacks &
  PinchGestureCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonResumableProps, 'maxScale'>;

export type ResumableZoomType = {
  reset: (animate?: boolean) => void;
  requestState: () => CommonZoomState<number>;
  assignState: (state: ResumableZoomAssignableState, animate?: boolean) => void;
};
