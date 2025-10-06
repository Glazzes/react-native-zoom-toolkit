import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Animated from 'react-native-reanimated';

import { theme } from '../../../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


/*
 * Just a text area component nothing relevant here.
 */
export default function TextArea() {
  const insets = useSafeAreaInsets()

  return (
    <Animated.View style={[styles.root, { height: 48 + insets.bottom, paddingBottom: insets.bottom }]}>
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
