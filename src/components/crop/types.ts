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
  MANAGED = 'managed',
  OVERLAY = 'overlay',
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
  /**
   * @description Request internal transformation values of this component at the moment of the calling.
   * @returns Internal state of the component.
   * @see https://glazzes.github.io/react-native-zoom-toolkit/components/cropzoom.html#cropzoomstate
   */
  requestState: () => CropZoomState;

  /**
   * @description Assigns the internal transformation values of this component, if the state you have
   * provided is considered to be not valid, it'll be approximated to the closest values you provided.
   * @see https://glazzes.github.io/react-native-zoom-toolkit/components/resumablezoom.html#cropzoomassignablestate
   */
  assignState: (state: CropZoomAssignableState, animate?: boolean) => void;

  /**
   * @description Rotates in steps of 90 degrees at a time in a range from 0 to 360 degrees.
   * @param animate Whether to animate the transition or not.
   * @param cb Callback to trigger at the beginning of the transition, as its only argument receives
   *  the angle your component will transition to, this angle ranges from 0 to 360 degrees (at 360 degrees it's clamped to 0).
   */
  rotate: RotateTransitionCallback;

  /**
   * @description Rotates in steps of 90 degrees at a time, either in the positive or negative direction, within a range from 0 to 360 degrees (or 0 to -360 degrees).
   * @param animate Whether to animate the transition or not.
   * @param clockwise Whether to rotate clockwise (90 degrees) or counterclockwise (-90 degrees).
   * @param cb Callback to trigger at the beginning of the transition, as its only argument receives
   *  the angle your component will transition to, this angle ranges from 0 to 360 degrees (or 0 to -360 degrees) and at 360 degrees (or -360 degrees) it is clamped back to 0.
   */
  rotateWithDirection: DirectionRotationCallback;

  /**
   * @description Rotates the Y axis from 0 to 180 degrees and vice versa
   * @param animate Whether to animate the transition or not.
   * @param cb Callback to trigger at the beginning of the transition, as its only argument receives
   * the angle your component will transition to, values are 0 or 180.
   */
  flipHorizontal: RotateTransitionCallback;

  /**
   * @description Rotates the X axis from 0 to 180 degrees and vice versa.
   * @param animate Whether to animate the transition or not.
   * @param cb Callback to trigger at the beginning of the transition, as its only argument receives
   * the angle your component will transition to, values are 0 or 180.
   */
  flipVertical: RotateTransitionCallback;

  /**
   * @description Resets all transformations to their initail state.
   * @param animate Whether to animate the transition or not.
   */
  reset: (animate?: boolean) => void;

  /**
   * @description Map all the transformations applied to your component into a simple and ready
   * to use object specifying the context necessary for a crop operation, such object must be used
   * along with a library capable of cropping images and/or videos, for instance Expo Image Manipulator.
   * @param {number} fixedWidth Enforce all resulting crops to be of a fixed width, height is
   * inferred by the computed aspect ratio of CropZoom's cropSize property.
   * @returns {object} An object representing the crop position and size, as well as  the necesary context to
   * achieve the desired crop.
   * @see https://glazzes.github.io/react-native-zoom-toolkit/components/cropzoom.html#cropcontextresult
   */
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
