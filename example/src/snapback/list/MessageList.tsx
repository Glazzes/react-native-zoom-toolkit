import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  useWindowDimensions,
  StyleSheet,
  type CellRendererProps,
  type ListRenderItemInfo,
} from 'react-native';

import Animated, {
  useSharedValue,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Constants from 'expo-constants';

import Appbar from './components/Appbar';
import TextArea from './components/TextArea';
import ImageMessage from './messages/ImageMessage';
import CellRenderer from './messages/CellRenderer';

import { theme } from '../../constants';

type MessageListProps = {
  keyboardTranslateY: SharedValue<number>;
};

const barHeight = Constants.statusBarHeight * 2;

function keyExtractor(item: string, index: number): string {
  return `key-${item}-${index}`;
}

function seperator() {
  return <View style={styles.separator} />;
}

const images = [
  'https://d-cb.jc-cdn.com/sites/crackberry.com/files/styles/large/public/article_images/2022/12/macbook-air-m2-crackberry-1.jpg',
  'https://cdn.britannica.com/02/132502-050-F4667944/macaw.jpg',
  'https://cdn.britannica.com/02/132502-050-F4667944/macaw.jpg',
  'https://www.akc.org/wp-content/uploads/2017/11/Dalmatian-History-09.jpg',
];

const MessageList: React.FC<MessageListProps> = ({ keyboardTranslateY }) => {
  const { height } = useWindowDimensions();
  const activeIndex = useSharedValue<number>(-1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardTranslateY.value }],
  }));

  // I just add the appbar and text area into a single component for simplicity
  const renderAppbar = useCallback(() => {
    return (
      <View>
        <Animated.View style={animatedStyle}>
          <Appbar />
        </Animated.View>

        <View style={[styles.textArea, { top: height - barHeight }]}>
          <TextArea />
        </View>
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  const cellRenderer = useCallback(
    (cell: CellRendererProps<string>) => {
      return (
        <CellRenderer
          index={cell.index}
          activeIndex={activeIndex}
          children={cell.children}
        />
      );
    },
    [activeIndex]
  );

  const renderItem = useCallback(
    (info: ListRenderItemInfo<string>) => {
      return (
        <ImageMessage
          uri={info.item}
          index={info.index}
          activeIndex={activeIndex}
          useResizeConfig={info.index === 2}
        />
      );
    },
    [activeIndex]
  );

  return (
    <FlatList
      data={images}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      stickyHeaderIndices={[0]}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets={true}
      showsVerticalScrollIndicator={true}
      ItemSeparatorComponent={seperator}
      ListHeaderComponent={renderAppbar}
      CellRendererComponent={cellRenderer}
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    height: theme.spacing.m,
  },
  content: {
    zIndex: 1000,
    paddingBottom: theme.spacing.m + barHeight,
  },
  textArea: {
    width: '100%',
    position: 'absolute',
  },
});

export default MessageList;
