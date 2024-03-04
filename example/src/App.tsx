import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SkiaCropZoom } from './cropzoom';

type AppProps = {};

const App: React.FC<AppProps> = ({}) => {
  return <SkiaCropZoom />;
};

export default gestureHandlerRootHOC(App);
