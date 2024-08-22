import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Orientation from 'expo-screen-orientation';

Orientation.lockAsync(Orientation.OrientationLock.PORTRAIT_UP);

import { default as CustomDrawer } from '../src/navigation/Drawer';
import { StyleSheet } from 'react-native';

const _layout = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Drawer
        screenOptions={{ headerShown: false }}
        drawerContent={CustomDrawer}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="resumableskia" />
        <Drawer.Screen name="resumablegallery" />
        <Drawer.Screen name="cropmanaged" />
        <Drawer.Screen name="cropoverlay" />
      </Drawer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default _layout;
