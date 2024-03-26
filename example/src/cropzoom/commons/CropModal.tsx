import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { theme } from '../../constants';
import Animated, { Easing, ZoomIn, ZoomOut } from 'react-native-reanimated';

type CropModalProps = {
  uri: string;
  setCrop: (uri: string | undefined) => void;
};

/*
 * Just a modal that displays the crop result image.
 */
const CropModal: React.FC<CropModalProps> = ({ uri, setCrop }) => {
  const resetCrop = () => {
    setCrop(undefined);
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.overlay]}>
      <Animated.View
        entering={ZoomIn.duration(300)
          .delay(200)
          .easing(Easing.bezierFn(0.58, -0.05, 0.35, 1.31))}
        exiting={ZoomOut.duration(200)}
      >
        <View style={[styles.modal, styles.center]}>
          <Text style={styles.title}>Your resulting crop</Text>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          <Pressable style={[styles.button, styles.center]} onPress={resetCrop}>
            <Text style={styles.title}>Dismiss</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: Number.MAX_SAFE_INTEGER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modal: {
    width: 300,
    gap: theme.spacing.m,
    padding: theme.spacing.m,
    backgroundColor: '#1D1E22',
    borderRadius: 8,
  },
  image: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  button: {
    width: '100%',
    height: 44,
    backgroundColor: '#303137',
    borderRadius: 8,
  },
});

export default CropModal;
