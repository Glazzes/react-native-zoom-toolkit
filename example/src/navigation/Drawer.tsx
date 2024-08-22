import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '../../src/constants';
import Constans from 'expo-constants';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

type LinkProps = {
  name: string;
  screen: string;
  isActive: boolean;
};

const barHeight = Constans.statusBarHeight;

const screens = [
  { name: 'ResumableZoom Example', screen: 'index' },
  { name: 'ResumableZoom Skia Example', screen: 'resumableskia' },
  { name: 'Gallery Example', screen: 'resumablegallery' },
  { name: 'CropZoom Managed Example', screen: 'cropmanaged' },
  { name: 'CropZoom Skia Example', screen: 'cropoverlay' },
  { name: 'SnapbackZoom Example', screen: 'snapback' },
];

const ScreenLink: React.FC<LinkProps> = ({ name, screen, isActive }) => {
  return (
    <View style={[styles.link, isActive ? undefined : styles.linkInactive]}>
      <Link href={screen} asChild={true}>
        <Pressable>
          <Text style={isActive ? styles.text : styles.textInactive}>
            {name}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
};

const Drawer = (props: DrawerContentComponentProps) => {
  return (
    <View style={styles.root}>
      <View style={styles.separator}>
        {screens.map((screen, index) => {
          return (
            <ScreenLink
              name={screen.name}
              screen={screen.screen}
              isActive={props.state.index === index}
              key={screen.name}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#141318',
    paddingTop: barHeight + theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
  },
  separator: {
    gap: theme.spacing.m,
  },
  link: {
    padding: theme.spacing.s + theme.spacing.xs,
    backgroundColor: '#272D39',
    borderRadius: theme.spacing.s,
  },
  linkInactive: {
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textInactive: {
    color: '#A0A0A0',
    fontWeight: 'bold',
  },
});

export default Drawer;
