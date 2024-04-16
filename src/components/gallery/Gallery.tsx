import React from 'react';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import type {
  LayoutChangeEvent,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { useSizeVector } from '../../commons/hooks/useSizeVector';
import GalleryItem from './GalleryItem';

type GalleryProps<T> = {
  data: T[];
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  edgeTapToItem?: boolean;
};

const Gallery = <T extends unknown>({
  data,
  renderItem: userRenderItem,
  keyExtractor,
  edgeTapToItem = true,
}: GalleryProps<T>) => {
  const animatedRef = useAnimatedRef<FlatList<T>>();

  const activeIndex = useSharedValue<number>(0);
  const scroll = useSharedValue<number>(0);
  const scrollOffset = useSharedValue<number>(0);

  const container = useSizeVector(0, 0);

  useDerivedValue(() => {
    scrollTo(animatedRef, scroll.value, 0, false);
  }, [scroll, animatedRef]);

  useDerivedValue(() => {}, [activeIndex]);

  const renderItem = (info: ListRenderItemInfo<T>): React.ReactElement => {
    return (
      <GalleryItem
        index={info.index}
        itemCount={data.length}
        edgeTapToItem={edgeTapToItem}
        activeIndex={activeIndex}
        container={container}
        scroll={scroll}
        scrollOffset={scrollOffset}
      >
        {userRenderItem(info)}
      </GalleryItem>
    );
  };

  const onLayout = (e: LayoutChangeEvent) => {
    container.width.value = e.nativeEvent.layout.width;
    container.height.value = e.nativeEvent.layout.height;
  };

  return (
    <Animated.FlatList
      ref={animatedRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      scrollEnabled={false}
      horizontal={true}
      onLayout={onLayout}
      onContentSizeChange={() => {}}
    />
  );
};

export default Gallery;
