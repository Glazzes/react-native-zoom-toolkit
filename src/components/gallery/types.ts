import type React from 'react';

type RenderInfo<T> = (item: T, index: number) => React.ReactElement;
type KeyExtractor<T> = (item: T, index: number) => string;

export type GalleryProps<T = unknown> = {
  data: T[];
  renderItem: RenderInfo<T>;
  keyExtractor?: KeyExtractor<T>;
  initialIndex?: number;
  numberToRender?: number;
  onIndexChange?: (index: number) => void;
  onScroll?: (scroll: number, offset: number) => void;
};

export type GalleryType = {
  scrollToIndex: (index: number) => void;
  reset: () => void;
};
