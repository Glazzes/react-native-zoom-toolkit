import type {
  CommonZoomProps,
  CommonZoomState,
  PinchGestureCallbacks,
  SizeVector,
  TapGestureCallbacks,
} from '../../commons/types';

export type ResizeConfig = {
  size: SizeVector<number>;
  aspectRatio: number;
  scale: number;
};

export type SnapbackZoomState<T> = {
  x: T;
  y: T;
  resizedWidth: T | undefined;
  resizedHeight: T | undefined;
} & CommonZoomState<T>;

export type SnapBackZoomProps = React.PropsWithChildren<{
  resizeConfig?: ResizeConfig;
  gesturesEnabled?: boolean;
  onUpdate?: (e: SnapbackZoomState<number>) => void;
}> &
  PinchGestureCallbacks &
  TapGestureCallbacks &
  CommonZoomProps;
