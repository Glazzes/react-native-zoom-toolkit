import type { ViewStyle } from 'react-native';
import type {
  CommonZoomState,
  LongPressEvent,
  PanGestureCallbacks,
  PinchMode,
  PinchGestureCallbacks,
  ScaleMode,
  SizeVector,
  SwipeDirection,
  TapGestureEvent,
  ZoomEventCallbacks,
} from '../../commons/types';

export type GalleryTransitionState = {
  index: number;
  activeIndex: number;
  gap: number;
  direction: 'vertical' | 'horizontal';
  isScrolling: boolean;
  scroll: number;
  gallerySize: SizeVector<number>;
};

export type GalleryTransitionCallback = (
  options: GalleryTransitionState
) => ViewStyle;

export type GalleryProps<T = unknown> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
} & Partial<{
  keyExtractor: (item: T, index: number) => string;
  maxScale: number | SizeVector<number>[];
  initialIndex: number;
  windowSize: number;
  gap: number;
  vertical: boolean;
  allowOverflow: boolean;
  tapOnEdgeToItem: boolean;
  zoomEnabled: boolean;
  scaleMode: ScaleMode;
  allowPinchPanning: boolean;
  pinchMode: PinchMode;
  longPressDuration: number;
  customTransition: GalleryTransitionCallback;
  onTap: (e: TapGestureEvent, index: number) => void;
  onLongPress: (e: LongPressEvent, index: number) => void;
  onSwipe: (direction: SwipeDirection) => void;
  onIndexChange: (index: number) => void;
  onScroll: (scroll: number, contentOffset: number) => void;
  onUpdate: (state: CommonZoomState<number>) => void;
  onVerticalPull: (translateY: number, released: boolean) => void;
  onGestureEnd: () => void;
}> &
  PinchGestureCallbacks &
  PanGestureCallbacks &
  ZoomEventCallbacks;

export interface GalleryRefType {
  setIndex: (index: number) => void;
  reset: (animate: boolean | undefined) => void;
  getState: () => CommonZoomState<number>;
}
