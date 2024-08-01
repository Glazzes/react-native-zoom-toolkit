import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import {
  emitPauseVideoEvent,
  emitPlayVideoEvent,
  emitStopVideoEvent,
} from '../utils/emitter';
import { MediaType, type Asset } from 'expo-media-library';
import TimeSlider from './TimeSlider';

type VideoControlsProps = {
  assets: Asset[];
  activeIndex: SharedValue<number>;
  progress: SharedValue<number>;
  isSeeking: SharedValue<boolean>;
  opacity: SharedValue<number>;
};

const INDICATOR_SIZE = 64;

// Transparent absolute positioned views let touches pass through them to comoponents below it
const VideoControls: React.FC<VideoControlsProps> = ({
  assets,
  activeIndex,
  progress,
  isSeeking,
  opacity,
}) => {
  const { width, height } = useWindowDimensions();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoAsset, setVideoAsset] = useState<Asset | null>(null);

  const onPlayBack = () => {
    setIsPlaying((prev) => !prev);

    if (isPlaying) {
      emitPauseVideoEvent(activeIndex.value);
    } else {
      emitPlayVideoEvent(activeIndex.value);
      opacity.value = withDelay(1000, withTiming(0));
    }
  };

  const onStop = () => {
    setIsPlaying(false);
    emitStopVideoEvent();
  };

  // First depending on your implementation this could be a simple useEffect
  // When the active index changes we send an event to stop any video that is playing
  useAnimatedReaction(
    () => activeIndex.value,
    (value) => {
      // We need to set seeking as true otherwise the playback event of the video component will
      // keep playing even is the video is meant to be stopped, in the video component we set
      // seeking to false on the stop event method
      isSeeking.value = true;
      progress.value = 0;

      runOnJS(onStop)();

      const currentAsset = assets[value]!;
      if (currentAsset.mediaType === MediaType.video) {
        opacity.value = withTiming(1, { duration: 150 });
        runOnJS(setVideoAsset)(currentAsset);
      } else {
        opacity.value = withTiming(0, { duration: 150 });
        runOnJS(setVideoAsset)(null);
      }
    },
    [activeIndex]
  );

  const rootStyle = useAnimatedStyle(() => ({
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={rootStyle}>
      <View style={styles.play}>
        <Pressable onPress={onPlayBack}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={32} color={'#fff'} />
        </Pressable>
      </View>

      {videoAsset !== null ? (
        <TimeSlider
          asset={videoAsset}
          progress={progress}
          isSeeking={isSeeking}
          activeIndex={activeIndex}
        />
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  play: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
});

export default VideoControls;
