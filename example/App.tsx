import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { CropManagedExample } from './src/cropzoom';

const App: React.FC = ({}) => {
  return <CropManagedExample />;
};

export default gestureHandlerRootHOC(App);
