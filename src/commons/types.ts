import type {
  GestureStateChangeEvent,
  PinchGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  LongPressGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Vector<T> = {
  x: T;
  y: T;
};

export type SizeVector<T> = {
  width: T;
  height: T;
};

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
export type PanMode = 'clamp' | 'free' | 'friction';
export type ScaleMode = 'clamp' | 'bounce';
export type PinchMode = 'clamp' | 'free';

export type CommonTransformState<T> = {
  translateX: T;
  translateY: T;
  scale: T;
};

export type CommonZoomState<T> = {
  containerSize: SizeVector<T>;
  childSize: SizeVector<T>;
  maxScale: T;
} & CommonTransformState<T>;

export type CommonResumableProps = Partial<{
  minScale: number;
  maxScale: number;
  panMode: PanMode;
  scaleMode: ScaleMode;
  allowPinchPanning: boolean;
  onGestureEnd: () => void;
}>;

export type TapGestureEvent =
  GestureStateChangeEvent<TapGestureHandlerEventPayload>;

export type PinchGestureEvent =
  GestureStateChangeEvent<PinchGestureHandlerEventPayload>;

export type PanGestureEvent =
  GestureStateChangeEvent<PanGestureHandlerEventPayload>;

export type LongPressEvent =
  GestureStateChangeEvent<LongPressGestureHandlerEventPayload>;

export type PanGestureEventCallback = (e: PanGestureEvent) => void;
export type TapGestureEventCallback = (e: TapGestureEvent) => void;
export type PinchGestureEventCallback = (e: PinchGestureEvent) => void;
export type LongPressGestreEventCallback = (e: LongPressEvent) => void;

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

export type LongPressCallbacks = Partial<{
  onLongPress: LongPressGestreEventCallback;
}>;

export type ZoomEventCallbacks = Partial<{
  onZoomBegin: (index: number) => void;
  onZoomEnd: (index: number) => void;
}>;

export type BoundsFuction = (scale?: number) => Vector<number>;
