import { Extrapolation, interpolate } from 'react-native-reanimated';
import type { GalleryAnimationBuilder } from '../../components/gallery/types';

export const galleryStackAnimation: GalleryAnimationBuilder = (options) => {
  'worklet';

  const { index, activeIndex, gallerySize, scroll, isScrolling } = options;

  if (index < activeIndex - 1 || index > activeIndex + 1) {
    return {
      opacity: 0,
      transform: [{ translateX: 0 }, { scale: 0 }],
    };
  }

  let translateX = index * gallerySize.width - scroll.x;
  let opacity = 1;
  let scale = 1;
  if (index !== activeIndex && !isScrolling) scale = 0;

  const isCurrent = index === activeIndex;
  const isNext = index === activeIndex + 1;
  if (isNext || (isCurrent && scroll.x < index * gallerySize.width)) {
    opacity = interpolate(
      scroll.x,
      [(index - 1) * gallerySize.width, index * gallerySize.width],
      [0, 1],
      Extrapolation.CLAMP
    );

    scale = 0.75 + 0.25 * opacity;
    translateX = 0;
  }

  return {
    opacity,
    transform: [{ translateX }, { scale }],
  };
};