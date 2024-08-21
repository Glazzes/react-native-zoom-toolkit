import type React from 'react';
import type {
  CommonResumableProps,
  CommonZoomProps,
  PanGestureCallbacks,
  PinchGestureCallbacks,
  SizeVector,
  TapGestureCallbacks,
} from '../../commons/types';

export enum CropMode {
  MANAGED,
  OVERLAY,
}

export type CropContextResult = {
  crop: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
  context: {
    rotationAngle: number;
    flipVertical: boolean;
    flipHorizontal: boolean;
  };
  resize?: SizeVector<number>;
};

export type CropZoomState = {
  width: number;
  height: number;
  translateX: number;
  translateY: number;
  scale: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
};

export type CropZoomAssignableState = Omit<CropZoomState, 'width' | 'height'>;

export type RotateTransitionCallback = (
  animate?: boolean,
  cb?: (value: number) => void
) => void;

export type DirectionRotationCallback = (
  animate?: boolean,
  clockwise?: boolean,
  cb?: (value: number) => void
) => void;

export type CropZoomType = {
  requestState: () => CropZoomState;
  assignState: (state: CropZoomAssignableState, animate?: boolean) => void;
  rotate: DirectionRotationCallback;
  flipHorizontal: RotateTransitionCallback;
  flipVertical: RotateTransitionCallback;
  reset: (animate?: boolean) => void;
  crop: (fixedWidth?: number) => CropContextResult;
};

export type CropGestureEventCallBack = (event: CropZoomState) => void;

export type CropZoomProps = React.PropsWithChildren<{
  cropSize: SizeVector<number>;
  resolution: SizeVector<number>;
  debug?: boolean;
  mode?: CropMode;
  onGestureActive?: CropGestureEventCallBack;
  OverlayComponent?: () => React.ReactElement<any>;
}> &
  PanGestureCallbacks &
  PinchGestureCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonZoomProps, 'hitSlop' | 'timingConfig'> &
  CommonResumableProps;
