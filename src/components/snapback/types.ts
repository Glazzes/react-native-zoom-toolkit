import type {
  CommonZoomCallbackProps,
  CommonZoomProps,
  SizeVector,
} from '../../commons/types';

export type ResizeConfig = {
  size: SizeVector<number>;
  aspectRatio: number;
  scale: number;
};

export type SnapbackPinchContextEvent = {
  x: number;
  y: number;
  width: number;
  height: number;
  resizedWidth: number;
  resizedHeight: number;
  translateX: number;
  translateY: number;
  scale: number;
};

export type SnapBackZoomProps = React.PropsWithChildren<{
  resizeConfig?: ResizeConfig;
  gesturesEnabled?: boolean;
  onGestureActive?: (e: SnapbackPinchContextEvent) => void;
  onGestureEnd?: () => void;
}> &
  CommonZoomProps &
  CommonZoomCallbackProps;
