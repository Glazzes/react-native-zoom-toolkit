import type React from 'react';
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

export type CommonZoomProps = {
  children?: React.ReactNode;
  zIndex?: number;
  hitSlop?: HitSlop;
  timingConfig?: WithTimingConfig;
};

type OnTapEvent = GestureStateChangeEvent<TapGestureHandlerEventPayload>;
type OnPinchEvent = GestureStateChangeEvent<PinchGestureHandlerEventPayload>;

export type CommonZoomCallbacks = {
  onTap?: (e: OnTapEvent) => void;
  onDoubleTap?: (e: OnTapEvent) => void;
  onPinchStart?: (e: OnPinchEvent) => void;
  onPinchEnd?: (e: OnPinchEvent, success: boolean) => void;
};
