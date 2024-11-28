import type React from 'react';
import type {
  CommonResumableProps,
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
  width: T;
  height: T;
  translateX: T;
  translateY: T;
  scale: T;
  rotate: T;
  rotateX: T;
  rotateY: T;
};

export type CropAssignableState = Omit<
  CropZoomState<number>,
  'width' | 'height'
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

export type CropZoomType = {
  requestState: () => CropZoomState<number>;
  assignState: (state: CropAssignableState, animate?: boolean) => void;
  rotate: RotationCallback;
  flipHorizontal: FlipCallback;
  flipVertical: FlipCallback;
  reset: (animate?: boolean) => void;
  crop: (fixedWidth?: number) => CropContextResult;
};

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
