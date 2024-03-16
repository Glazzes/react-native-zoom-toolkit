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

export type SnapbackZoomState = {
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
  onGestureActive?: (e: SnapbackZoomState) => void;
  onGestureEnd?: () => void;
}> &
  CommonZoomProps &
  Omit<CommonZoomCallbackProps, 'onPanStart' | 'onPanEnd'>;
