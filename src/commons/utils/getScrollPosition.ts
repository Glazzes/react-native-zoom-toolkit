type ScrollOptions = {
  index: number;
  itemSize: number;
  gap: number;
};

export const getScrollPosition = (options: ScrollOptions): number => {
  'worklet';

  const { index, itemSize, gap } = options;
  return index * itemSize + index * gap;
};
