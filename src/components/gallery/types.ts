import type { ViewStyle } from 'react-native';
import type {
  CommonZoomState,
  LongPressEvent,
  PanGestureCallbacks,
  PinchMode,
  PinchGestureCallbacks,
  ScaleMode,
  Size,
  SwipeDirection,
  TapGestureEvent,
  ZoomEventCallbacks,
  TimingConfig,
  TapGestureCallbacks,
} from '../../commons/types';

export type VerticalPullOptions = {
  translateY: number;
  released: boolean;
  velocityY: number;
};

export type GalleryTransitionState = {
  index: number;
  activeIndex: number;
  gap: number;
  direction: 'vertical' | 'horizontal';
  isScrolling: boolean;
  scroll: number;
  gallerySize: Size<number>;
};

export type GalleryTransitionCallback = (
  options: GalleryTransitionState
) => ViewStyle;

export type GalleryProps<T = unknown> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
} & Partial<{
  windowSize: number;
  keyExtractor: (item: T, index: number) => string;
  maxScale: number | Size<number>[];
  initialIndex: number;
  gap: number;
  rtl: boolean;
  vertical: boolean;
  allowOverflow: boolean;
  tapOnEdgeToItem: boolean;
  zoomEnabled: boolean;
  scaleMode: ScaleMode;
  allowPinchPanning: boolean;
  pinchMode: PinchMode;
  longPressDuration: number;
  snapTimingConfig: TimingConfig;
  /**
   * Fraction of an item that must be dragged before changing pages.
   * Values are clamped between 0 and 1.
   * @default 0.5
   */
  snapThreshold: number;
  /**
   * Maximum pan duration in milliseconds that can be recognized as a swipe.
   * @default 175
   */
  swipeTimeThreshold: number;
  /**
   * Minimum pan velocity in points per second that triggers a page swipe.
   * @default 500
   */
  swipeVelocityThreshold: number;
  /**
   * Minimum pan distance in points required before a swipe can change pages.
   * @default 20
   */
  swipeDistanceThreshold: number;
  customTransition: GalleryTransitionCallback;
  onTap: (e: TapGestureEvent, index: number) => void;
  onLongPress: (e: LongPressEvent, index: number) => void;
  onSwipe: (direction: SwipeDirection) => void;
  onIndexChange: (index: number) => void;
  onScroll: (scroll: number, contentOffset: number) => void;
  onUpdate: (state: CommonZoomState<number>) => void;
  onVerticalPull: (options: VerticalPullOptions) => void;
  onGestureEnd: () => void;
}> &
  PinchGestureCallbacks &
  PanGestureCallbacks &
  ZoomEventCallbacks &
  Omit<TapGestureCallbacks, 'onTap'>;

export interface GalleryRefType {
  setIndex: (index: number) => void;
  reset: (animate: boolean | undefined) => void;
  getState: () => CommonZoomState<number>;
}
