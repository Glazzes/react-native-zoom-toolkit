import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { SizeVector, Vector } from '../../commons/types';

export type GalleryContextType = {
  rootSize: SizeVector<SharedValue<number>>;
  rootChildSize: SizeVector<SharedValue<number>>;
  scroll: Vector<SharedValue<number>>;
  translate: Vector<SharedValue<number>>;
  scale: SharedValue<number>;
  activeIndex: SharedValue<number>;
  isScrolling: SharedValue<boolean>;
};

export const GalleryContext = React.createContext<GalleryContextType>(
  {} as GalleryContextType
);
