import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import Constants from 'expo-constants';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../../../constants';
import Animated from 'react-native-reanimated';

const barHeight = Constants.statusBarHeight;

/*
 * Just a text area component nothing relevant here.
 */
const TextArea: React.FC = () => {
  return (
    <Animated.View style={styles.root}>
      <Icon
        name={'sticker-emoji'}
        color={theme.colors.foregroundAccent}
        size={theme.sizes.iconSize}
      />

      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Message"
          placeholderTextColor={theme.colors.foregroundAccent}
        />
      </View>

      <View style={styles.iconContainer}>
        <Icon
          name={'clippy'}
          color={theme.colors.foregroundAccent}
          size={theme.sizes.iconSize}
        />
        <Icon
          name={'microphone'}
          color={theme.colors.foregroundAccent}
          size={theme.sizes.iconSize}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: barHeight * 2,
    backgroundColor: theme.colors.foreground,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
  },
  textInputContainer: {
    flex: 1,
  },
  textInput: {
    width: '100%',
    height: '100%',
    fontWeight: 'bold',
    color: theme.colors.foregroundAccent,
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
});

export default TextArea;
