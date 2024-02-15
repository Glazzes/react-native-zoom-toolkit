import type {
  GestureStateChangeEvent,
  PinchGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import type { HitSlop } from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';
import type { WithTimingConfig } from 'react-native-reanimated';

export type Source = {
  uri: string;
  headers?: Record<string, string>;
};

export type CanvasSize = {
  width: number;
  height: number;
};

export type ResizeConfig = {
  size: CanvasSize;
  aspectRatio: number;
  scale: number;
};

// Commom component stuff
export type CommonZoomProps = {
  hitSlop?: HitSlop;
  timingConfig?: WithTimingConfig;
};

export type OnTapEvent = GestureStateChangeEvent<TapGestureHandlerEventPayload>;
export type OnPinchEvent =
  GestureStateChangeEvent<PinchGestureHandlerEventPayload>;

export type PinchContext = {
  x: number;
  y: number;
  width: number;
  height: number;
  translateX: number;
  translateY: number;
  scale: number;
};

export type CommonZoomCallbackProps = {
  onTap?: (e: OnTapEvent) => void;
  onDoubleTap?: (e: OnTapEvent) => void;
  onPinchStart?: (e: OnPinchEvent) => void;
  onPinchEnd?: (e: OnPinchEvent, success: boolean) => void;
  onGestureActive?: (context: PinchContext) => void;
};
