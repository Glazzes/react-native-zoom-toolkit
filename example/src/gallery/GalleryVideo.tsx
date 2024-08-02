import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { type SharedValue } from 'react-native-reanimated';
import { ResizeMode, Video, type AVPlaybackStatus } from 'expo-av';
import type { Asset } from 'expo-media-library';

import { calculateItemSize } from './utils/utils';
import {
  listenToPauseVideoEvent,
  listenToPlayVideoEvent,
  listenToSeekVideoEvent,
  listenToStopVideoEvent,
} from './utils/emitter';

type GalleryVideoProps = {
  asset: Asset;
  index: number;
  isLooping: boolean;
  isSeeking: SharedValue<boolean>;
  progress: SharedValue<number>;
};

const GalleryVideo: React.FC<GalleryVideoProps> = ({
  asset,
  index,
  isLooping,
  isSeeking,
  progress,
}) => {
  const videoRef = useRef<Video>(null);
  const { width, height } = useWindowDimensions();

  const phoneAspectRatio = width / height;
  const size = calculateItemSize(
    { width: asset.width, height: asset.height },
    { width, height },
    phoneAspectRatio
  );

  const playback = (status: AVPlaybackStatus) => {
    if (status.isLoaded && !isSeeking.value) {
      progress.value = status.positionMillis / (asset.duration * 1000);
    }
  };

  const play = (activeIndex: number) => {
    if (activeIndex !== index) return;
    videoRef.current?.playAsync();
  };

  const pause = (activeIndex: number) => {
    if (activeIndex !== index) return;
    videoRef.current?.pauseAsync();
  };

  const stop = () => {
    videoRef.current?.stopAsync().finally(() => (isSeeking.value = false));
  };

  const seek = async (options: { positionMillis: number; index: number }) => {
    const { positionMillis, index: activeIndex } = options;
    if (index !== activeIndex) return;

    await videoRef.current?.setPositionAsync(positionMillis);
    progress.value = positionMillis / (asset.duration * 1000);
    isSeeking.value = false;
  };

  useEffect(() => {
    const playSub = listenToPlayVideoEvent(play);
    const pauseSub = listenToPauseVideoEvent(pause);
    const stopSub = listenToStopVideoEvent(stop);
    const seekSub = listenToSeekVideoEvent(seek);

    return () => {
      playSub.remove();
      pauseSub.remove();
      stopSub.remove();
      seekSub.remove();
    };
  });

  return (
    <Video
      ref={videoRef}
      source={{ uri: asset.uri }}
      style={{ ...size }}
      resizeMode={ResizeMode.COVER}
      shouldPlay={false}
      isLooping={isLooping}
      progressUpdateIntervalMillis={50}
      onPlaybackStatusUpdate={playback}
    />
  );
};

export default GalleryVideo;
