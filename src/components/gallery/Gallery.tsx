import React, { forwardRef, useImperativeHandle } from 'react';
import Animated, {
  runOnJS,
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
import type { GalleryProps, GalleryType } from './types';
import type { ResumableZoomState } from '../resumable/types';

const Gallery = <T extends unknown>(
  props: GalleryProps<T>,
  ref: React.ForwardedRef<GalleryType> | undefined
) => {
  const {
    data,
    onIndexChange,
    renderItem: userRenderItem,
    onLayout: userOnLayout,
    keyExtractor,
    tapOnEdgeToItem = true,
  } = props;

  const animatedRef = useAnimatedRef<FlatList<T>>();

  const resetIndex = useSharedValue<number>(-1);
  const stateIndex = useSharedValue<number>(-1);
  const stateCB = useSharedValue<
    ((state: ResumableZoomState) => void) | undefined
  >(undefined);

  const activeIndex = useSharedValue<number>(0);
  const scroll = useSharedValue<number>(0);
  const scrollOffset = useSharedValue<number>(0);

  const container = useSizeVector(0, 0);

  useDerivedValue(() => {
    scrollTo(animatedRef, scroll.value, 0, false);
  }, [scroll, animatedRef]);

  useDerivedValue(() => {
    if (onIndexChange !== undefined) {
      runOnJS(onIndexChange)(activeIndex.value);
    }
  }, [activeIndex]);

  const renderItem = (info: ListRenderItemInfo<T>): React.ReactElement => {
    return (
      <GalleryItem
        index={info.index}
        itemCount={data.length}
        tapOnEdgeToItem={tapOnEdgeToItem}
        activeIndex={activeIndex}
        resetIndex={resetIndex}
        stateIndex={stateIndex}
        stateCB={stateCB}
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
    userOnLayout?.(e);
  };

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index, animate = true) => {
      animatedRef.current?.scrollToIndex({ index, animated: animate });
    },
    reset: (index) => (resetIndex.value = index ?? activeIndex.value),
    requestState: (cb) => {
      stateCB.value = cb;
      stateIndex.value = activeIndex.value;
    },
  }));

  return (
    <Animated.FlatList
      {...props}
      ref={animatedRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      scrollEnabled={false}
      horizontal={true}
      onLayout={onLayout}
    />
  );
};

type GalleryPropsWithRef<T> = GalleryProps<T> & {
  ref?: React.ForwardedRef<GalleryType>;
};

export default forwardRef(Gallery) as <T>(
  props: GalleryPropsWithRef<T>
) => ReturnType<typeof Gallery>;
