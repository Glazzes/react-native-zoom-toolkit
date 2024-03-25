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
};

export type ResumableZoomProps = React.PropsWithChildren<{
  /**
   * @description Whether to apply a decay animation when the pan gesture ends or not.
   * @default true
   * @see https://docs.swmansion.com/react-native-reanimated/docs/animations/withDecay/
   */
  decay?: boolean;

  /**
   * @description Enables and disables both single and double tap gestures.
   * @default true
   */
  tapsEnabled?: boolean;

  /**
   * @description Enables and disables both pan and swipe gestures.
   * @default true
   */
  panEnabled?: boolean;

  /**
   * @description Enables and disables the pinch gesture.
   * @default true
   */
  pinchEnabled?: boolean;

  /**
   * @description Maximum scale value allowed by the pinch gesture, expects values 
   * bigger than or equals one.

   * Alternatively you can pass the resolution of your image or video, for instance  {width: 1920, height: 1080}; 
   * this will instruct the component to calculate maxScale  in such a way it's a value just before
   * images and videos start getting pixelated.
   * @default 6
   */
  maxScale?: SizeVector<number> | number;

  /**
   * @description Callback triggered when a swipe to the left gesture has occurred, this callback is
   *  only triggered when your component is at its minimum scale and panMode property is set to
   * PanMode.CLAMP.
   */
  onSwipeLeft?: () => void;

  /**
   * @description Callback triggered when a swipe to the right gesture has occurred, this callback is
   * only triggered when your component is at its minimum scale and panMode property is set to
   * PanMode.CLAMP
   */
  onSwipeRight?: () => void;

  /**
   * @description Worklet Callback triggered as the user interacts with the component, it also means
   * interacting through its methods, ideal if you need to mirror the internal state of the
   * component to some other component as it updates.
   * @param e Internal state of the gesture.
   * @see https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/
   * @see https://glazzes.github.io/react-native-zoom-toolkit/components/resumablezoom.html#resumablezoomstate
   */
  onGestureActive?: (e: ResumableZoomState) => void;

  /**
   * @description Callback triggered when the component has been panned beyond the boundaries
   * defined by its enclosing container, ideal property to mimic scroll behavior.
   * This callback is only triggered when the panMode property is set to PanMode.CLAMP.
   */
  onHorizontalBoundsExceeded?: (value: number) => void;
}> &
  PanGestureCallbacks &
  PinchGestureCallbacks &
  Omit<TapGestureCallbacks, 'onDoubleTap'> &
  Omit<CommonResumableProps, 'maxScale'> &
  Omit<CommonZoomProps, 'timingConfig'>;
