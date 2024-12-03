import React, { forwardRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { clamp } from '../../commons/utils/clamp';
import { useVector } from '../../commons/hooks/useVector';
import { useSizeVector } from '../../commons/hooks/useSizeVector';

import Gallery from './Gallery';
import { GalleryContext, type GalleryContextType } from './context';
import type { GalleryProps, GalleryType } from './types';

const GalleryProvider = <T extends unknown>(
  props: GalleryProps<T>,
  ref?: React.ForwardedRef<GalleryType>
) => {
  const startIndex = clamp(props.initialIndex ?? 0, 0, props.data.length - 1);
  const activeIndex = useSharedValue<number>(startIndex);

  const rootSize = useSizeVector(0, 0);
  const rootChildSize = useSizeVector(0, 0);

  const translate = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const scroll = useSharedValue<number>(0);
  const scrollOffset = useSharedValue<number>(0);
  const isScrolling = useSharedValue<boolean>(false);

  const hasZoomed = useSharedValue<boolean>(false);
  const overflow = useSharedValue<'hidden' | 'visible'>('hidden');
  const hideAdjacentItems = useSharedValue<boolean>(false);

  const context: GalleryContextType = {
    rootSize,
    rootChildSize,
    scroll,
    scrollOffset,
    translate,
    activeIndex,
    isScrolling,
    scale,
    hasZoomed,
    overflow,
    hideAdjacentItems,
  };

  return (
    <GalleryContext.Provider value={context}>
      <Gallery {...props} initialIndex={startIndex} reference={ref} />
    </GalleryContext.Provider>
  );
};

type GalleryPropsWithRef<T> = GalleryProps<T> & {
  ref?: React.ForwardedRef<GalleryType>;
};

export default forwardRef(GalleryProvider) as <T>(
  props: GalleryPropsWithRef<T>
) => ReturnType<typeof Gallery>;
