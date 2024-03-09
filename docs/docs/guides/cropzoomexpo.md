---
outline: deep
---

# Using Crop Zoom with Expo Image Manipulator
[Expo Image Manipulator](#https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) is by far my favorite library for this particular use case because of its unoppinionated nature and feature set which includes horizontal flipping, vertical flipping, rotation and resizing image capabilities, in others words a feature set that aligns very well with one the provided by [CroopZoom](/components/cropzoom#crop).

## What we'll be building
We will be building a simple example in which we overlay the resulting crop image in top of CropZoom component so you can see results are accurate, in order to see both the crop and gesture detection areas we will make use of the [debug](/components/cropzoom#debug) property.

The next video footage is how the end result looks like.

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/guideexpo.mp4" controls />
</div>

## Setup
Make sure you've followed the [Installation](/installation) guide first then you will need to install Expo image manipulator library.

::: code-group

```sh [npm]
npm install expo-image-manipulator
```

```sh [yarn]
yarn install expo-image-manipulator
```

```sh [expo]
expo install expo-image-manipulator
```

:::

Copy and paste the following boilerplate code into your app, pay attention to `crop method` in the `Controls.tsx` file.

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
In `Controls.tsx` we could see crop method is empty, lets address that by using [manipulateAsync](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/#imagemanipulatormanipulateasyncuri-actions-saveoptions) method from Expo Image Manipulator.

Although [manipulateAsync](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/#imagemanipulatormanipulateasyncuri-actions-saveoptions) method lets you apply actions in any order you want, we must follow a specific order to ensure both performance and the desired functionality:
- Resize
- Flip Horizontal
- Flip Vertical
- Rotate
- Crop

First we must call [crop method](/components/cropzoom#crop) from `cropRef` property as it will give us with all the info we need to perform a crop operation, all actions are optional except the crop action itself therefore we need to make some checks to ensure the desired result while maintaining the previous mentioned order.

```typescript
const crop = async () => {
  const result = cropRef.current?.crop(280);
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
}
```

With all actions in place all we need to do is crop our image and set the result with `setCrop` property, add the following to the bottom of `crop method`.

```typescript
const cropResult = await manipulateAsync(uri, actions);
setCrop(cropResult.uri);

// In case you want to keep testing add this property
setTimeout(() => {
  setCrop(undefined);
}, 2500);
```

## Whats is next?
This example is pretty basic, you can check out both [Example app](https://github.com/Glazzes/react-native-zoomable/tree/main/example)'s CroopZoom examples, however you can keep working in this example, how about:

- Making it prettier.
- Using different images.
- Testing with different `cropSize` values, nobody said `width` and `height` properties must be equals.
