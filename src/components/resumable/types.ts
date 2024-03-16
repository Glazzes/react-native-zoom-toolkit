import type React from 'react';
import type {
  CommonResumableProps,
  CommonZoomProps,
  PanGestureCallbacks,
  PinchGestureCallbacks,
  SizeVector,
  TapGestureCallbacks,
} from '../../commons/types';

export type ResumableZoomState = {
  width: number;
  height: number;
  translateX: number;
  translateY: number;
  scale: number;
};

export type ResumableZoomType = {
  reset: (animate?: boolean) => void;
  requestState: () => ResumableZoomState;
};

export type ResumableZoomProps = React.PropsWithChildren<{
  decay?: boolean;
  tapsEnabled?: boolean;
  panEnabled?: boolean;
  pinchEnabled?: boolean;
  maxScale?: SizeVector<number> | number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onGestureActive?: (e: ResumableZoomState) => void;
  onHorizontalBoundsExceeded?: (value: number) => void;
}> &
  PanGestureCallbacks &
  PinchGestureCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonResumableProps, 'maxScale'> &
  Omit<CommonZoomProps, 'timingConfig'>;
