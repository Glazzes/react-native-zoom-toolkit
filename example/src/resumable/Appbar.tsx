import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { theme } from '../constants';
import { useRouter } from 'expo-router';

type AppbarProps = {
  translateY: SharedValue<number>;
};

const barHeight = Constants.statusBarHeight;
const appbarHeight = barHeight * 3.1;

/*
 * Just an appbar component that hides when you tap on the image.
 * Nothing relevant or interesting here.
 */
const Appbar: React.FC<AppbarProps> = ({ translateY }) => {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, styles.root]}>
      <View style={styles.container}>
        <Pressable onPress={goBack}>
          <Icon name={'arrow-left'} size={24} color={'#fff'} />
        </Pressable>
        <View style={styles.usernameContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            React Native Zoom Toolkit
          </Text>
          <Text style={styles.timestamp}>Today at 2:00 pm</Text>
        </View>
        <Icon name={'brush'} size={24} color={'#fff'} />
        <Icon name={'share'} size={24} color={'#fff'} />
        <Icon name={'dots-vertical'} size={24} color={'#fff'} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: appbarHeight,
    paddingTop: barHeight,
    paddingHorizontal: theme.spacing.m,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  usernameContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  timestamp: {
    color: '#fff',
    fontSize: 12,
  },
});

export default Appbar;
