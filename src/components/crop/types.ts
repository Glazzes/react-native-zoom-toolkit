import type React from 'react';
import type {
  CommonResumableProps,
  CommonZoomState,
  PanGestureCallbacks,
  PinchGestureCallbacks,
  SizeVector,
  TapGestureCallbacks,
} from '../../commons/types';

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
  rotate: T;
  rotateX: T;
  rotateY: T;
} & CommonZoomState<T>;

export type CropZoomTransformState = Omit<
  CropZoomState<number>,
  'containerSize' | 'childSize' | 'maxScale'
>;

export type FlipCallback = (
  animate?: boolean,
  cb?: (value: number) => void
) => void;

export type RotationCallback = (
  animate?: boolean,
  clockwise?: boolean,
  cb?: (value: number) => void
) => void;

export type CropGestureEventCallBack = (event: CropZoomState<number>) => void;

export type CropZoomProps = React.PropsWithChildren<{
  cropSize: SizeVector<number>;
  resolution: SizeVector<number>;
  onUpdate?: CropGestureEventCallBack;
  OverlayComponent?: () => React.ReactElement<any>;
}> &
  CommonResumableProps &
  PanGestureCallbacks &
  PinchGestureCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'>;

export interface CropZoomRefType {
  getState: () => CropZoomState<number>;
  setTransformState: (state: CropZoomTransformState, animate?: boolean) => void;
  rotate: RotationCallback;
  flipHorizontal: FlipCallback;
  flipVertical: FlipCallback;
  reset: (animate?: boolean) => void;
  crop: (fixedWidth?: number) => CropContextResult;
}
