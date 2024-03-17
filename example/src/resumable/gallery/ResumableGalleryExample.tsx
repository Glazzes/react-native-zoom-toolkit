import React, { useCallback } from 'react';
import Animated, {
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  View,
  StyleSheet,
  FlatList,
  type ListRenderItemInfo,
} from 'react-native';
import { StatusBar, setStatusBarHidden } from 'expo-status-bar';

import ListImage from './ListImage';
import Appbar from '../basic/Appbar';

import { images } from './constants';
import Constants from 'expo-constants';
import ScrollPreview from './ScrollPreview';

const barHeight = Constants.statusBarHeight;

function keyExtractor(item: string, index: number) {
  return `${item}-${index}`;
}

const ResumableGalleryExample: React.FC = () => {
  const ref = useAnimatedRef<FlatList<string>>();

  const scrollX = useSharedValue<number>(0);
  const scrollOffset = useSharedValue<number>(0);

  const translateY = useSharedValue<number>(0);

  // Wheter to hide or display the appbar and footer
  const onTap = () => {
    let toY = -1 * barHeight * 3.1;
    if (translateY.value !== 0) {
      toY = 0;
    }

    translateY.value = withTiming(toY);
    setStatusBarHidden(toY !== 0, 'slide');
  };

  // Updates the scroll position as flatlist is not allowed to be scrollable
  useAnimatedReaction(
    () => scrollX.value,
    (value) => {
      scrollTo(ref, value, 0, false);
    }
  );

  const renderItem = useCallback(
    (info: ListRenderItemInfo<string>) => {
      return (
        <ListImage
          uri={info.item}
          index={info.index}
          onTap={onTap}
          scrollX={scrollX}
          scrollOffset={scrollOffset}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollX, scrollOffset]
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Appbar translateY={translateY} />
      <Animated.FlatList
        ref={ref}
        data={images}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={true}
        horizontal={true}
      />
      <ScrollPreview
        scrollX={scrollX}
        scrollOffset={scrollOffset}
        translateY={translateY}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default ResumableGalleryExample;
