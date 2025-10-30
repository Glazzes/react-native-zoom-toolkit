import type React from 'react';

import type { GestureType } from 'react-native-gesture-handler';
import type { HitSlop } from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';

import type {
  CommonTransformState,
  LongPressCallbacks,
  PinchGestureCallbacks,
  Size,
  TapGestureCallbacks,
  TimingConfig,
  Vector,
} from '../../commons/types';

export type BlocksGesture =
  | GestureType
  | React.RefObject<GestureType | undefined>
  | React.RefObject<React.ComponentType<{}> | undefined>;

export type ResizeConfig = {
  size: Size<number>;
  aspectRatio: number;
  scale: number;
};

export type SnapbackZoomState<T> = {
  size: Size<T>;
  position: Vector<T>;
  resize?: Size<T>;
} & CommonTransformState<T>;

export type SnapBackZoomProps = React.PropsWithChildren<
  Partial<{
    minScale: number;
    maxScale: Size<number> | number;
    resizeConfig: ResizeConfig;
    gesturesEnabled: boolean;
    longPressDuration: number;
    hitSlop: HitSlop;
    timingConfig: TimingConfig;
    scrollRef: BlocksGesture;
    onGestureEnd: () => void;
    onUpdate: (e: SnapbackZoomState<number>) => void;
  }>
> &
  PinchGestureCallbacks &
  TapGestureCallbacks &
  LongPressCallbacks;
