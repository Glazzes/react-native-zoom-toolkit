import type React from 'react';
import type {
  CommonResumableProps,
  PanGestureCallbacks,
  PinchGestureCallbacks,
  SizeVector,
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

export type CropZoomType = {
  /**
   * @description Rotates in steps of 90 degrees at a time in a range from 0 to 360 degrees
   * @param {boolean} animate whether to animate the transition or not
   */
  rotate: (animate?: boolean) => void;

  /**
   * @description Rotates the Y axis from 0 to 180 degrees and vice versa
   * @param {boolean} animate whether to animate the transition or not
   */
  flipHorizontal: (animate?: boolean) => void;

  /**
   * @description Rotates the X axis from 0 to 180 degrees and vice versa
   * @param {boolean} animate whether to animate the transition or not
   */
  flipVertical: (animate?: boolean) => void;

  /**
   * @description Resets all transformations to their initail state
   * @param {boolean} animate whether to animate the transition or not
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
   * achieve the crop
   *
   * context property: object reprenseting the actions required before cropping, these must executed
   * in the following order:
   * - rotationAngle property indicate to what angle the image/video must be rotated, this one is
   * measured in degrees
   * - resizeWidth and resizeHeight properties indicate to what dimensions a image/video must be
   * resized to be cropped properly
   * - flipHorizontal and flipVertical properties indicate wheter to flip the image vertically
   * and/or horizontally
   *
   * crop property includes position and size for the desired crop
   * - position in x and y
   * - width and height of the desired crop
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
  CommonResumableProps;
