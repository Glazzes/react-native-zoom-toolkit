import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { CropManagedExample } from './src/cropzoom';

type AppProps = {};

const App: React.FC<AppProps> = ({}) => {
  return <CropManagedExample />;
};

export default gestureHandlerRootHOC(App);
