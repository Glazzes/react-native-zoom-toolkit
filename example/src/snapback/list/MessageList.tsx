import React, { useCallback } from 'react';
import {
  View,
  useWindowDimensions,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import ImageMessage from '../messages/ImageMessage';
import Appbar from './Appbar';
import { FlashList } from '@shopify/flash-list';
import { theme } from '../../constants';
import Animated, {
  useSharedValue,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Constants from 'expo-constants';
import TextArea from './TextArea';
import VideoMessage from '../messages/VideoMessage';

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
  }, [height, animatedStyle]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => {
      if (index === 1) {
        return <VideoMessage index={index} activeIndex={activeIndex} />;
      }

      return (
        <ImageMessage
          uri={item}
          index={index}
          activeIndex={activeIndex}
          useResizeConfig={index === 2}
        />
      );
    },
    [activeIndex]
  );

  return (
    <View style={styles.root}>
      <FlashList
        data={images}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={300}
        ListHeaderComponent={renderAppbar}
        ItemSeparatorComponent={seperator}
        contentContainerStyle={styles.content}
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
    paddingBottom: theme.spacing.m + barHeight,
  },
  textArea: {
    width: '100%',
    position: 'absolute',
  },
});

export default MessageList;
