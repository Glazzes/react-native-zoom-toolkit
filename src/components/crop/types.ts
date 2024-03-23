import type React from 'react';
import type {
  CommonResumableProps,
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

export type RotateTransitionCallback = (
  animate?: boolean,
  cb?: (value: number) => void
) => void;

export type CropZoomType = {
  /**
   * @description Rotates in steps of 90 degrees at a time in a range from 0 to 360 degrees
   * @param {boolean} animate whether to animate the transition or not
   * @param cb callback to trigger at beggining of the transition.
   */
  rotate: RotateTransitionCallback;

  /**
   * @description Rotates the Y axis from 0 to 180 degrees and vice versa
   * @param {boolean} animate whether to animate the transition or not.
   * @param cb callback to trigger at beggining of the transition
   */
  flipHorizontal: RotateTransitionCallback;

  /**
   * @description Rotates the X axis from 0 to 180 degrees and vice versa.
   * @param {boolean} animate whether to animate the transition or not.
   * @param cb callback to trigger at beggining of the transition
   */
  flipVertical: RotateTransitionCallback;

  /**
   * @description Resets all transformations to their initail state.
   * @param {boolean} animate whether to animate the transition or not.
   * @param cb callback to trigger at the end of the transition, its only called if animate parameter
   * is set to true.
   */
  reset: (animate?: boolean) => void;

  /**
   * @description Calculates the position and size of the pinch gesture transformations relative to
   * the resolution (image/video dimensios) of the component being pinched
   *
   * @param {number} fixedWidth By default all crops are dynamic based on the crop area and image/video
   * dimensions, with this parameter you can enforce all of your crops to be of a fixed width, height
   * is infered by the computed CroopZoom's cropSize property aspect ratio.
   *
   * @returns {object} An object representing the crop position and size, as well as  the necesary context to
   * achieve the crop:
   *
   * crop property: Top left corner and size of the crop.
   * context property: Fields specify if the image/video needs to flipped and to what angle must
   * be rotated, the angle is measured in degrees.
   * resize property: Fields specify the size your image/video must be resized to before cropping,
   * if this property is undefined it means no resizing is necessary. This property is always
   * undefined if you called this method without fixedWidth argument.
   */
  crop: (fixedWidth?: number) => CropContextResult;
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
  CommonResumableProps;
