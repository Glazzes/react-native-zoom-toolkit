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

You'll build a simple example in which you'll overlay the resulting crop image on top of CropZoom component's
crop area so you can see results are accurate, in order to see both the crop and gesture detection areas
you will make use of the [debug](/components/cropzoom#debug) property.

The next video footage shows what the end result looks like.

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/guideexpo.mp4" controls />
</div>

## Setup

Make sure you've followed the [Installation](/installation) guide first then you will need to install
Expo image manipulator library.

::: code-group

```sh [npm]
npm install expo-image-manipulator
```

```sh [yarn]
yarn add expo-image-manipulator
```

```sh [expo]
expo install expo-image-manipulator
```

:::

Copy and paste the following boilerplate code into your app and pay attention to crop method in Controls.tsx file.

::: code-group

```tsx:line-numbers=1 [App.tsx]
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { CropZoom, useImageResolution, type CropZoomType } from 'react-native-zoom-toolkit';
import { StatusBar } from 'expo-status-bar';
import Controls from './Controls';

const image = 'https://eskipaper.com/images/happy-dog-background-1.jpg';
const cropSize = { width: 280, height: 280 };

const App: React.FC = ({}) => {
  const ref = useRef<CropZoomType>(null);
  const [crop, setCrop] = useState<string | undefined>(undefined);

  const { isFetching, resolution } = useImageResolution({ uri: image });
  if (isFetching || resolution === undefined) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CropZoom
        debug={true}
        ref={ref}
        cropSize={cropSize}
        resolution={resolution}
      >
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMethod="scale"
        />
      </CropZoom>

      <Controls uri={image} cropRef={ref} setCrop={setCrop} />

      {crop && (
        <Image source={{ uri: crop }} style={[styles.overlay, cropSize]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
  },
});

export default App;
```

```tsx{17-19} [Controls.tsx]
import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import type { CropZoomType } from 'react-native-zoom-toolkit';
import { type Action, FlipType, manipulateAsync } from 'expo-image-manipulator';

type ControlsProps = {
  uri: string;
  cropRef: React.RefObject<CropZoomType>;
  setCrop: (value: string | undefined) => void;
};

const Controls: React.FC<ControlsProps> = ({ uri, cropRef, setCrop }) => {
  const rotate = () => cropRef.current?.rotate();
  const flipH = () => cropRef.current?.flipHorizontal();
  const flipV = () => cropRef.current?.flipVertical();

  const crop = async () => {

  };

  return (
    <View style={styles.root}>
      <Button title="Rotate" onPress={rotate} />
      <Button title="Flip H" onPress={flipH} />
      <Button title="Flip V" onPress={flipV} />
      <Button title="Crop" onPress={crop} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: 0,
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

- make it look pretty.
- use different aspect ratio size images.
- test with different `cropSize` property values, nobody said width and height dimensions must be equals.
- use `fixedWidth` argument with CropZoom's [crop method](/components/cropzoom#crop) to enforce resulting
  crops to be of any size you want.
