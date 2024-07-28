import type { Asset } from 'expo-media-library';
import React from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { convertTimeToText } from '../utils/time';
import ReText from './ReText';
import { emitSeekVideoEvent } from '../utils/emitter';

type TimeSliderProps = {
  asset: Asset;
  activeIndex: SharedValue<number>;
  progress: SharedValue<number>;
  isSeeking: SharedValue<boolean>;
};

const SLIDER_HEIGHT = 6;

const TimeSlider: React.FC<TimeSliderProps> = ({
  asset,
  progress,
  isSeeking,
  activeIndex,
}) => {
  const timerWidth = useSharedValue<number>(0);
  const translate = useSharedValue<number>(0);
  const offset = useSharedValue<number>(0);

  const time = useDerivedValue<string>(() => {
    return convertTimeToText(asset.duration, progress.value);
  }, [asset, progress]);

  const measureTimerWidth = (e: LayoutChangeEvent) => {
    timerWidth.value = e.nativeEvent.layout.width;
  };

  const seek = (positionMillis: number, index: number) => {
    emitSeekVideoEvent({ positionMillis, index });
  };

  const pan = Gesture.Pan()
    .hitSlop({ vertical: 10, horizontal: 10 })
    .maxPointers(1)
    .onStart(() => {
      offset.value = translate.value;

      // We start seeking so we stop receiving playback event updates from the video component
      isSeeking.value = true;
    })
    .onUpdate((e) => {
      const boundX = timerWidth.value - SLIDER_HEIGHT * 3;

      translate.value = clamp(offset.value + e.translationX, 0, boundX);
      progress.value = translate.value / boundX;
    })
    .onEnd(() => {
      const position = asset.duration * 1000 * progress.value;
      runOnJS(seek)(position, activeIndex.value);
    });

  const animatedStyles = useAnimatedStyle(() => {
    if (!isSeeking.value) {
      translate.value = interpolate(
        progress.value,
        [0, 1],
        [0, timerWidth.value - SLIDER_HEIGHT * 3],
        Extrapolation.CLAMP
      );
    }

    return { transform: [{ translateX: translate.value }] };
  });

  const progressStyles = useAnimatedStyle(() => {
    const width = interpolate(
      progress.value,
      [0, 1],
      [0, timerWidth.value],
      Extrapolation.CLAMP
    );

    return {
      width,
      height: SLIDER_HEIGHT,
      borderRadius: SLIDER_HEIGHT / 2,
      backgroundColor: '#fff',
      alignSelf: 'flex-start',
    };
  });

  return (
    <View style={styles.root}>
      <Text style={styles.videoTitle}>{asset.filename}</Text>

      <View style={[styles.timerContainer, styles.center]}>
        <View
          style={[styles.playbackSliderContainer, styles.center]}
          onLayout={measureTimerWidth}
        >
          <View style={styles.sliderBackground} />
          <Animated.View style={progressStyles} />
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.indicator, animatedStyles]} />
          </GestureDetector>
        </View>

        <View>
          <ReText text={time} style={styles.duration} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  root: {
    width: '100%',
    padding: 16,
    gap: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    position: 'absolute',
    bottom: 0,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#74B6E7',
  },
  timerContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  duration: {
    color: '#fff',
    fontSize: 15,
  },
  playbackSliderContainer: {
    flex: 1,
    height: 44,
  },
  indicator: {
    width: SLIDER_HEIGHT * 3,
    height: SLIDER_HEIGHT * 3,
    borderRadius: SLIDER_HEIGHT * 1.5,
    backgroundColor: '#fff',
    position: 'absolute',
    alignSelf: 'flex-start',
  },
  sliderBackground: {
    width: '100%',
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    backgroundColor: '#fff',
    opacity: 0.4,
    position: 'absolute',
  },
});

export default TimeSlider;
