import type { SizeVector, TapGestureEvent } from '../../commons/types';
import type { ResumableZoomState } from '../resumable/types';

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
  onIndexChange?: (index: number) => void;
  onScroll?: (scroll: number, contentOffset: number) => void;
};

export type GalleryType = {
  setIndex: (index: number) => void;
  reset: () => void;
  requestState: () => ResumableZoomState;
};
