import React, { useContext, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedRef,
  useAnimatedStyle,
  runOnUI,
  measure,
  type SharedValue,
  type WithTimingConfig,
} from 'react-native-reanimated';
import { ResizeMode, Video } from 'expo-av';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import { SnapbackZoom } from 'react-native-zoom-toolkit';

import { maxDimension, theme } from '../../../constants';
import { ReflectionContext } from '../../context';

type VideoMessageProps = {
  index: number;
  activeIndex: SharedValue<number>;
};

const config: WithTimingConfig = { duration: 150, easing: Easing.linear };

const VideoMessage: React.FC<VideoMessageProps> = ({ index, activeIndex }) => {
  const ref = useRef<Video>(null);
  const opacity = useSharedValue<number>(1);

  const animatedRef = useAnimatedRef();
  const backgroundColor = useSharedValue<string>(theme.colors.friendMessage);
  const {
    width,
    height,
    backgroundColor: reflectionColor,
    x,
    y,
  } = useContext(ReflectionContext);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
    borderRadius: 8,
    padding: theme.spacing.xs / 2,
  }));

  const onPinchStart = () => {
    activeIndex.value = index;
    reflectionColor.value = backgroundColor.value;

    runOnUI(() => {
      'worklet';
      const measurement = measure(animatedRef);
      if (measurement) {
        width.value = measurement.width;
        height.value = measurement.height;
        x.value = measurement.pageX;
        y.value = measurement.pageY;
      }

      backgroundColor.value = 'transparent';
    })();

    playback();
  };

  const onGestureEnd = () => {
    activeIndex.value = -1;
    x.value = -1 * maxDimension;
    y.value = -1 * maxDimension;
    backgroundColor.value = theme.colors.friendMessage;
    playback();
  };

  const playback = async () => {
    if (ref.current === null) {
      return;
    }

    const status = await ref.current.getStatusAsync();
    if (status.isLoaded) {
      const isPlaying = status.isPlaying;
      opacity.value = isPlaying ? withTiming(1, config) : withTiming(0, config);
      const timeout = setTimeout(() => {
        isPlaying ? ref.current?.pauseAsync() : ref.current?.playAsync();
        clearTimeout(timeout);
      }, 50);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View ref={animatedRef} style={animatedStyle}>
        <SnapbackZoom
          onTap={playback}
          onPinchStart={onPinchStart}
          onGestureEnd={onGestureEnd}
        >
          <View>
            <Video
              ref={ref}
              isLooping={true}
              source={require('../../../../assets/video.mp4')}
              resizeMode={ResizeMode.COVER}
              style={styles.video}
            />

            <Animated.View style={[styles.overlay, { opacity }]}>
              <View style={styles.playButton}>
                <Icon
                  name={'play'}
                  color={theme.colors.icon}
                  size={theme.sizes.iconSize}
                />
              </View>
            </Animated.View>
          </View>
        </SnapbackZoom>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  video: {
    width: 200,
    height: 200,
    borderRadius: theme.spacing.s,
  },
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
});

export default React.memo(VideoMessage);
