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

export type ResumableZoomAssignableState = Omit<
  ResumableZoomState,
  'width' | 'height'
>;

export type ResumableZoomProps = React.PropsWithChildren<{
  decay?: boolean;
  extendGestures?: boolean;
  tapsEnabled?: boolean;
  panEnabled?: boolean;
  pinchEnabled?: boolean;
  maxScale?: SizeVector<number> | number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onGestureActive?: (e: ResumableZoomState) => void;
  onHorizontalBoundsExceeded?: (exceededBy: number) => void;
}> &
  PanGestureCallbacks &
  PinchGestureCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonResumableProps, 'maxScale'> &
  Omit<CommonZoomProps, 'timingConfig'>;

export type ResumableZoomType = {
  /**
   * @description Reset all transformations to their initial state.
   * @param animate Whether to animate the transition or not, defaults to true.
   */
  reset: (animate?: boolean) => void;

  /**
   * @description Request internal transformation values of this component at the moment of the calling.
   * @returns Internal state of the component.
   * @see https://glazzes.github.io/react-native-zoom-toolkit/components/resumablezoom.html#resumablezoomstate
   */
  requestState: () => ResumableZoomState;

  /**
   * @description Assigns the internal transformation values of this component, if the state you have
   * provided is considered to be not valid, it'll be approximated to the closest values you provided.
   * @see https://glazzes.github.io/react-native-zoom-toolkit/components/resumablezoom.html#resumablezoomassignablestate
   */
  assignState: (state: ResumableZoomAssignableState, animate?: boolean) => void;
};
