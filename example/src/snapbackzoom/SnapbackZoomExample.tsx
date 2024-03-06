import React from 'react';
import { ImageBackground, SafeAreaView, StyleSheet } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { ReflectionProvider } from './reflection/ReflectionContext';
import MessageList from './list/MessageList';
import Reflection from './reflection/Reflection';

const SnapbackZoomExample: React.FC = ({}) => {
  return (
    <SafeAreaView style={styles.root}>
      <ReflectionProvider>
        <ImageBackground
          source={require('../../assets/pattern.png')}
          style={styles.root}
          imageStyle={styles.image}
        >
          <Reflection />
          <MessageList />
        </ImageBackground>
      </ReflectionProvider>
    </SafeAreaView>
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
