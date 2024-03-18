import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { ResumableZoomGalleryExample } from './src/resumable';

const App: React.FC = ({}) => {
  return <ResumableZoomGalleryExample />;
};

export default gestureHandlerRootHOC(App);
