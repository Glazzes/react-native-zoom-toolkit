import type {
  GestureStateChangeEvent,
  PinchGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import type { HitSlop } from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';
import type {
  EasingFunction,
  EasingFunctionFactory,
  ReduceMotion,
} from 'react-native-reanimated';

export type TimingConfig = Partial<{
  duration: number;
  easing: EasingFunction | EasingFunctionFactory;
  reduceMotion: ReduceMotion;
}>;

export type Vector<T> = {
  x: T;
  y: T;
};

export type SizeVector<T> = {
  width: T;
  height: T;
};

export type BoundsFuction = (scale: number) => Vector<number>;

export enum SwipeDirection {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

/**
 * @description Determine how your component must behave when it reaches the specified boundaries
 * by its enclosing container.
 */
export enum PanMode {
  /** @description Prevents the user from dragging the component out of the specified boundaries. */
  CLAMP,

  /**
   * @description Lets the user drag the component around freely, when the pan gesture ends
   * the component will return to a position within the specified boundaries.
   */
  FREE,

  /**
   * @description Lets the user drag the component around freely applying friction to the pan gesture
   * up to a point where it's stopped completely, when the pan gesture ends the component will return
   * to a position within the specified boundaries.
   */
  FRICTION,
}

/**
 * @description Determine how your component must behave when the pinch gesture's scale value
 * exceeds the specified boundaries by minScale and maxScale properties.
 */
export enum ScaleMode {
  /**
   * @description Prevents the user from exceeding the scale boundaries.
   */
  CLAMP,

  /**
   * @description Lets the user scale above and below the scale boundary values, when the pinch
   * gesture ends the scale value returns to minScale or maxScale respectively.
   */
  BOUNCE,
}

export type CommonZoomProps = Partial<{
  hitSlop: HitSlop;
  timingConfig: TimingConfig;
  onGestureEnd: () => void;
}>;

export type CommonResumableProps = Partial<{
  minScale: number;
  maxScale: number;
  panMode: PanMode;
  scaleMode: ScaleMode;
  allowPinchPanning: boolean;
}>;

export type TapGestureEvent =
  GestureStateChangeEvent<TapGestureHandlerEventPayload>;

export type PinchGestureEvent =
  GestureStateChangeEvent<PinchGestureHandlerEventPayload>;

export type PanGestureEvent =
  GestureStateChangeEvent<PanGestureHandlerEventPayload>;

export type PanGestureEventCallback = (e: PanGestureEvent) => void;
export type TapGestureEventCallback = (e: TapGestureEvent) => void;
export type PinchGestureEventCallback = (e: PinchGestureEvent) => void;

export type PanGestureCallbacks = Partial<{
  onPanStart: PanGestureEventCallback;
  onPanEnd: PanGestureEventCallback;
}>;

export type PinchGestureCallbacks = Partial<{
  onPinchStart: PinchGestureEventCallback;
  onPinchEnd: PinchGestureEventCallback;
}>;

export type TapGestureCallbacks = Partial<{
  onTap: TapGestureEventCallback;
  onDoubleTap: TapGestureEventCallback;
}>;
