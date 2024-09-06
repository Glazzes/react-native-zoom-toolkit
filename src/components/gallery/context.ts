import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { SizeVector, Vector } from '../../commons/types';

export type GalleryContextType = {
  rootSize: SizeVector<SharedValue<number>>;
  rootChildSize: SizeVector<SharedValue<number>>;
  translate: Vector<SharedValue<number>>;
  scale: SharedValue<number>;
  scroll: SharedValue<number>;
  scrollOffset: SharedValue<number>;
  activeIndex: SharedValue<number>;
  fetchIndex: SharedValue<number>;
  isScrolling: SharedValue<boolean>;
  hasZoomed: SharedValue<boolean>;
};

export const GalleryContext = React.createContext<GalleryContextType>(
  {} as GalleryContextType
);
