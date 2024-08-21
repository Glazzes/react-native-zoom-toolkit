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

export type SnapbackZoomState = {
  x: number;
  y: number;
  resizedWidth: number | undefined;
  resizedHeight: number | undefined;
} & CommonZoomState;

export type SnapBackZoomProps = React.PropsWithChildren<{
  resizeConfig?: ResizeConfig;
  gesturesEnabled?: boolean;
  onGestureActive?: (e: SnapbackZoomState) => void;
}> &
  PinchGestureCallbacks &
  TapGestureCallbacks &
  CommonZoomProps;
