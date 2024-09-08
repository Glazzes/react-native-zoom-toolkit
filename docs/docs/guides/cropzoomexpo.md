---
title: How to use CropZoom and Expo Image Manipulator
outline: deep
---

# CropZoom and Expo Image Manipulator

Expo Image Manipulator is by far my favorite library for this particular use case because of its
unoppinionated nature and feature set which includes horizontal flipping, vertical flipping, rotation and
resizing image capabilities, in others words a feature set that aligns very well with one the provided
by [CroopZoom](/components/cropzoom#crop) component.

## What you'll be building

You will focus on replicating the footage example seen in CropZoom's documentation, in other words a simple
full-screen cropper screen, however this one has a small difference rather than a dimiss menu you will overlay
the resulting on top of the cropper so you can see crops are accurate.

The next footage is pretty much how the end result will look like.

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/cropzoom.mp4" controls />
</div>

## Setup

For mere simplicity we'll create an expo managed project and install the required dependencies by running the
following commands:

```sh
npx create-expo-app "crop-example" --template "blank-typescript"
cd crop-example
npx expo install react-native-reanimated react-native-gesture-handler @shopify/react-native-skia react-native-zoom-toolkit
```

By watching the video we can split the logic into the three following files:

- `App.tsx` the main file contaning structure of your cropper.
- `SVGOverlay.tsx` the file with the svg with a hole in it to determine the crop section.
- `Controls.tsx` the file contaning the pressables to flip, rotate and crop. This one is absolute positioned at the
  bottom of the screen.

Copy and paste the following boilerplate code into your app and pay attention to crop method in Controls.tsx file.

::: code-group

```tsx [App.tsx]
import React, { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  CropZoom,
  useImageResolution,
  type CropZoomType,
  type SizeVector,
} from 'react-native-zoom-toolkit';

import Controls from './Controls';
import SVGOverlay from './SVGOverlay';

const IMAGE =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const App = ({}) => {
  const cropRef = useRef<CropZoomType>(null);

  const { width } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri: IMAGE });

  const [result, setResult] = useState<string | undefined>(undefined);

  const cropSize: SizeVector<number> = {
    width: width * 0.8,
    height: width * 0.8,
  };

  const renderOverlay = () => {
    return <SVGOverlay cropSize={cropSize} />;
  };

  if (isFetching || resolution === undefined) {
    return null;
  }

  return (
    <View style={styles.root}>
      <CropZoom
        ref={cropRef}
        cropSize={cropSize}
        resolution={resolution}
        OverlayComponent={renderOverlay}
      >
        <Image
          source={{ uri: IMAGE }}
          style={styles.image}
          resizeMethod="scale"
        />
      </CropZoom>

      <Controls uri={IMAGE} cropRef={cropRef} setCrop={setResult} />

      {/*
       * Display the resulting image on top of the crop screen
       */}
      {result !== undefined ? (
        <Pressable
          onPress={() => setResult(undefined)}
          style={{ position: 'absolute' }}
        >
          <Image source={{ uri: result }} style={cropSize} />
        </Pressable>
      ) : null}

      <StatusBar style="light" translucent={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default App;
```

```tsx [SVGOverlay.tsx]
import React, { useMemo } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

import type { SizeVector } from 'react-native-zoom-toolkit';

type SVGOverlayProps = {
  cropSize: SizeVector<number>;
};

/*
 * Draws an SVG as big as the space cropzoom is ocuppying in the screen, this
 * one also draws a "hole" in it as big as the crop size.
 */
const SVGOverlay: React.FC<CropOverlayProps> = ({ cropSize }) => {
  const { width, height } = useWindowDimensions();

  const path = useMemo(() => {
    const center = { x: width / 2, y: height / 2 };
    const commands = [
      'M 0 0',
      `h ${width} v ${height}`,
      `h ${-width} v ${-height}`,
      `M ${center.x - cropSize.width / 2} ${center.y}`,
      `a 1 1 0 0 0 ${cropSize.width} 0`,
      `a 1 1 0 0 0 ${-1 * cropSize.height} 0`,
    ].join(' ');

    return Skia.Path.MakeFromSVGString(commands)!;
  }, [width, height, cropSize]);

  return (
    <Canvas style={{ width, height }}>
      <Path path={path} color={'rgba(0, 0, 0, 0.4)'} />
    </Canvas>
  );
};

export default SVGOverlay;
```

```tsx{41-43,71} [Controls.tsx]
import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import type { CropZoomType } from 'react-native-zoom-toolkit';

type ControlProps = {
  uri: string;
  setCrop: (uri: string | undefined) => void;
  cropRef: React.RefObject<CropZoomType>;
};

const activeColor = "#75DAEA";
const baseColor = "#FFFFFF";

const Controls: React.FC<ControlProps> = ({ uri, cropRef, setCrop }) => {
  const [isCropping, setIsCropping] = useState<boolean>(false);

  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [isFlippedV, setIsFlippedV] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);

  const rotate = () => {
    cropRef?.current?.rotate(true, true, (angle) => {
      setIsRotated(angle !== 0);
    });
  };

  const flipHorizontal = () => {
    cropRef?.current?.flipHorizontal(true, (angle) => {
      setIsFlippedH(angle === 180);
    });
  };

  const flipVertical = () => {
    cropRef.current?.flipVertical(true, (angle) => {
      setIsFlippedV(angle === 180);
    });
  };

  const crop = async () => {

  };

  return (
    <View style={styles.root}>
      <Pressable onPress={rotate}>
        <Icon
          name={'format-rotate-90'}
          size={24}
          color={isRotated ? activeColor : baseColor}
        />
      </Pressable>

      <Pressable onPress={flipHorizontal}>
        <Icon
          name={'flip-horizontal'}
          size={24}
          color={isFlippedH ? activeColor : baseColor}
        />
      </Pressable>

      <Pressable onPress={flipVertical}>
        <Icon
          name={'flip-vertical'}
          size={24}
          color={isFlippedV ? activeColor : baseColor}
        />
      </Pressable>

      <Pressable style={styles.button} onPress={crop}>
        {isCropping ? (
          <ActivityIndicator size={'small'} color={baseColor} />
        ) : (
          <Icon name={'check'} size={24} color={'#fff'} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 24,
    position: 'absolute',
    bottom: 0
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#75DAEA',
  },
});

export default Controls;
```

:::

## Crop Method

In Controls.tsx file you could see crop method is empty, lets address that by using [manipulateAsync](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/#imagemanipulatormanipulateasyncuri-actions-saveoptions)
method from Expo Image Manipulator, this method allows you to apply the following actions to an image of your
choice: flip horizontally and/or vertically, rotate, resize and crop.

Although [manipulateAsync](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/#imagemanipulatormanipulateasyncuri-actions-saveoptions)
method lets you apply actions in any order you want, you must follow an specific order to ensure both performance
and the desired functionality:

- resize
- flip horizontal
- flip vertical
- rotate
- crop

For this use case all actions are optional except the crop action, therefore you'll need to make some checks
to maintain the previous mentioned order, so let's get to it.

- call [crop method](/components/cropzoom#crop) from cropRef property as it will give you the context required
  to perform a crop operation.
- perform the checks in the specified order.

```typescript
const crop = async () => {
  const result = cropRef.current?.crop();
  if (result === undefined) {
    return;
  }

  const actions: Action[] = [];
  if (result.resize !== undefined) {
    actions.push({ resize: result.resize });
  }

  if (result.context.flipHorizontal) {
    actions.push({ flip: FlipType.Horizontal });
  }

  if (result.context.flipVertical) {
    actions.push({ flip: FlipType.Vertical });
  }

  if (result.context.rotationAngle !== 0) {
    actions.push({ rotate: result.context.rotationAngle });
  }

  actions.push({ crop: result.crop });
};
```

With all action checks in place all that remains is to crop the image and set the result with `setCrop` property, add the following to the end of `crop method`.

```typescript:line-numbers=25
const cropResult = await manipulateAsync(uri, actions);
setCrop(cropResult.uri);

// Add this in case you want to keep testing
setTimeout(() => {
  setCrop(undefined);
}, 2500);
```

## What's next?

This example is pretty basic, you can check out both [Example app](https://github.com/Glazzes/react-native-zoomable/tree/main/example)'s CroopZoom examples, however you can keep working in this example, how about:

- use different aspect ratio size images.
- test with different `cropSize` property values, nobody said width and height dimensions must be equals.
- use `fixedWidth` argument with CropZoom's [crop method](/components/cropzoom#crop) to enforce resulting
  crops to be of any size you want.
