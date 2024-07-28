// Taken from https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx
import React from 'react';
import type { TextProps as RNTextProps } from 'react-native';
import { StyleSheet, TextInput } from 'react-native';
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';

const styles = StyleSheet.create({
  baseStyle: {
    color: 'black',
  },
});

type ReTextProps = {
  text: SharedValue<string>;
  style?: RNTextProps['style'];
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
Animated.addWhitelistedNativeProps({ text: true });

const ReText: React.FC<ReTextProps> = ({ text, style }) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.value,
      // Here we use any because the text prop is not available in the type
    } as any;
  }, [text]);

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      underlineColorAndroid="transparent"
      editable={false}
      value={text.value}
      style={[styles.baseStyle, style || undefined]}
    />
  );
};

export default ReText;
