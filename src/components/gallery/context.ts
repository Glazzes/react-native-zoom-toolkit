import React from 'react';

import type { SharedValue } from 'react-native-reanimated';

import type { Size, Vector } from '../../commons/types';

export type GalleryContextType = {
  rootSize: Size<SharedValue<number>>;
  rootChildSize: Size<SharedValue<number>>;
  translate: Vector<SharedValue<number>>;
  scale: SharedValue<number>;
  scroll: SharedValue<number>;
  scrollOffset: SharedValue<number>;
  activeIndex: SharedValue<number>;
  isScrolling: SharedValue<boolean>;
  hasZoomed: SharedValue<boolean>;
  overflow: SharedValue<'hidden' | 'visible'>;
  hideAdjacentItems: SharedValue<boolean>;
};

export const GalleryContext = React.createContext<GalleryContextType>(
  {} as GalleryContextType
);
