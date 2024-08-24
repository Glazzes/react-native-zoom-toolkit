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

export type CropZoomState<T> = {
  width: T;
  height: T;
  translateX: T;
  translateY: T;
  scale: T;
  rotate: T;
  rotateX: T;
  rotateY: T;
};

export type CropZoomAssignableState = Omit<
  CropZoomState<number>,
  'width' | 'height'
>;

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
  requestState: () => CropZoomState<number>;
  assignState: (state: CropZoomAssignableState, animate?: boolean) => void;
  rotate: DirectionRotationCallback;
  flipHorizontal: RotateTransitionCallback;
  flipVertical: RotateTransitionCallback;
  reset: (animate?: boolean) => void;
  crop: (fixedWidth?: number) => CropContextResult;
};

export type CropGestureEventCallBack = (event: CropZoomState<number>) => void;

export type CropZoomProps = React.PropsWithChildren<{
  cropSize: SizeVector<number>;
  resolution: SizeVector<number>;
  debug?: boolean;
  mode?: CropMode;
  onUpdate?: CropGestureEventCallBack;
  OverlayComponent?: () => React.ReactElement<any>;
}> &
  PanGestureCallbacks &
  PinchGestureCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonZoomProps, 'hitSlop' | 'timingConfig'> &
  CommonResumableProps;
