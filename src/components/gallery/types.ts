import type { ViewStyle } from 'react-native';
import type {
  PanGestureCallbacks,
  PinchGestureCallbacks,
  SizeVector,
  SwipeDirection,
  TapGestureEvent,
  Vector,
} from '../../commons/types';
import type { ResumableZoomState } from '../resumable/types';

export type GalleryAnimationOptions = {
  index: number;
  activeIndex: number;
  vertical: boolean;
  isScrolling: boolean;
  gallerySize: SizeVector<number>;
  scroll: Vector<number>;
};

export type GalleryAnimationBuilder = (
  options: GalleryAnimationOptions
) => ViewStyle;

export type GalleryProps<T = unknown> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  maxScale?: number | SizeVector<number>[];
  initialIndex?: number;
  windowSize?: number;
  tapOnEdgeToItem?: boolean;
  allowPinchPanning?: boolean;
  onTap?: (e: TapGestureEvent, index: number) => void;
  onSwipe?: (direction: SwipeDirection) => void;
  onIndexChange?: (index: number) => void;
  onScroll?: (scroll: number, contentOffset: number) => void;
} & PinchGestureCallbacks &
  PanGestureCallbacks;

export type GalleryType = {
  setIndex: (index: number) => void;
  reset: () => void;
  requestState: () => ResumableZoomState;
};
