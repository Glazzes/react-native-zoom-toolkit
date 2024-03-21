import React, { useEffect } from 'react';
import {
  ImageBackground,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { ReflectionProvider } from './reflection/ReflectionContext';
import MessageList from './list/MessageList';
import Reflection from './reflection/Reflection';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const SnapbackZoomExample: React.FC = ({}) => {
  const { width, height } = useWindowDimensions();
  const keyboardTranslateY = useSharedValue<number>(0);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ translateY: -1 * keyboardTranslateY.value }],
  }));

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardTranslateY.value = e.endCoordinates.height;
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', (_) => {
      keyboardTranslateY.value = 0;
      Keyboard.dismiss();
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [keyboardTranslateY]);

  return (
    <ReflectionProvider>
      <SafeAreaView style={{ width, height }}>
        <ImageBackground
          source={require('../../assets/pattern.png')}
          style={styles.root}
          imageStyle={styles.image}
        >
          {/* Reflection must be placed before the list because of zIndex */}
          <Reflection />

          <Animated.View style={animatedStyle}>
            <MessageList keyboardTranslateY={keyboardTranslateY} />
          </Animated.View>
        </ImageBackground>
      </SafeAreaView>
    </ReflectionProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
  },
  image: {
    opacity: 0.3,
  },
});

export default gestureHandlerRootHOC(SnapbackZoomExample);
