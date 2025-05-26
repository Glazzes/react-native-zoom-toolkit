import type React from 'react';
import type {
  EasingFunction,
  EasingFunctionFactory,
  ReduceMotion,
} from 'react-native-reanimated';
import type { GestureType } from 'react-native-gesture-handler';
import type { HitSlop } from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';

import type {
  CommonTransformState,
  LongPressCallbacks,
  PinchGestureCallbacks,
  SizeVector,
  TapGestureCallbacks,
  Vector,
} from '../../commons/types';

export type BlocksGesture =
  | GestureType
  | React.RefObject<GestureType | undefined>
  | React.RefObject<React.ComponentType<{}> | undefined>;

export type TimingConfig = Partial<{
  duration: number;
  easing: EasingFunction | EasingFunctionFactory;
  reduceMotion: ReduceMotion;
}>;

export type ResizeConfig = {
  size: SizeVector<number>;
  aspectRatio: number;
  scale: number;
};

export type SnapbackZoomState<T> = {
  size: SizeVector<T>;
  position: Vector<T>;
  resize?: SizeVector<T>;
} & CommonTransformState<T>;

export type SnapBackZoomProps = React.PropsWithChildren<
  Partial<{
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
