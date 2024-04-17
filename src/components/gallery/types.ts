import type { FlatListProps, ListRenderItemInfo } from 'react-native';
import type { TapGestureEvent } from '../../commons/types';
import type { ResumableZoomState } from '../resumable/types';

export type GalleryProps<T = unknown> = {
  data: T[];
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  tapOnEdgeToItem?: boolean;
  onIndexChange?: (index: number) => void;
  onTap?: (e: TapGestureEvent, index: number) => void;
} & Omit<
  FlatListProps<T>,
  'renderItem' | 'keyExtractor' | 'scrollEnabled' | 'horizontal'
>;

export type GalleryType = {
  scrollToIndex: (index: number, animate?: boolean) => void;
  reset: (index?: number) => void;
  requestState: (cb: (state: ResumableZoomState) => void) => void;
};
