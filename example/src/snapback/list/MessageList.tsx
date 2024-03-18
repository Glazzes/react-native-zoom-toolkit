import React, { useCallback } from 'react';
import {
  View,
  useWindowDimensions,
  StyleSheet,
  type CellRendererProps,
  type ListRenderItemInfo,
} from 'react-native';
import ImageMessage from '../messages/ImageMessage';
import Appbar from './Appbar';
import { FlatList } from 'react-native-gesture-handler';
import { theme } from '../../constants';
import CellRenderer from '../messages/CellRenderer';
import { useSharedValue } from 'react-native-reanimated';
import Constants from 'expo-constants';
import TextArea from './TextArea';
import VideoMessage from '../messages/VideoMessage';

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

const MessageList: React.FC = () => {
  const { height } = useWindowDimensions();
  const activeIndex = useSharedValue<number>(-1);

  // I just add the appbar and text area into a single component for simplicity
  const renderAppbar = useCallback(() => {
    return (
      <View>
        <Appbar />
        <View style={[styles.textArea, { top: height - barHeight }]}>
          <TextArea />
        </View>
      </View>
    );
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
      if (info.index === 1) {
        return <VideoMessage index={info.index} activeIndex={activeIndex} />;
      }

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
    <View style={[styles.root]}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        ItemSeparatorComponent={seperator}
        ListHeaderComponent={renderAppbar}
        CellRendererComponent={cellRenderer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
