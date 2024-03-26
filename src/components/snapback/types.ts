import type {
  CommonZoomProps,
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
  width: number;
  height: number;
  resizedWidth: number | undefined;
  resizedHeight: number | undefined;
  translateX: number;
  translateY: number;
  scale: number;
};

export type SnapBackZoomProps = React.PropsWithChildren<{
  /**
   * @description Dynamically recalculates SnapBackZoom component's width and height style properties
   * to align with a given aspect ratio based on a scale value as the gesture scale increases.
   * @see https://glazzes.github.io/react-native-zoom-toolkit/components/snapbackzoom.html#notes
   */
  resizeConfig?: ResizeConfig;

  /**
   * @description Enables or disable gestures, when gestures are disabled your component can detect
   * pointer events again.
   * @default true
   */
  gesturesEnabled?: boolean;

  /**
   * @description Worklet callback triggered from the moment pinch gesture starts until the snap back
   * animation finishes.
   * @param e Internal state of the gesture.
   * @see https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/
   * @see https://glazzes.github.io/react-native-zoom-toolkit/components/snapbackzoom.html#snapbackzoomstate
   */
  onGestureActive?: (e: SnapbackZoomState) => void;

  /**
   * @description Callback triggered once the snap back animation has finished.
   */
  onGestureEnd?: () => void;
}> &
  PinchGestureCallbacks &
  TapGestureCallbacks &
  CommonZoomProps;
