---
title: getAspectRatioSize
description: Gets width and height based on the aspect ratio
outline: deep
---

# getAspectRatioSize
Gets width and height based on the aspect ratio.

## How to use
Let's assume you've got a HD image and you want to render this image with a max width of 200px.

```js
import { getAspectRatioSize } from 'react-native-zoom-toolkit';

const hdResolution = { width: 1920, height: 1080 };

// width is 200 and height is 112.5
const { width, height } = getAspectRatioSize({
  aspectRatio: hdResolution.width / hdResolution.height,
  width: 200
});

// Alternatively if you want to render your image with a height of 200
// use height property, width is 355 here.
const { width, height } = getAspectRatioSize({
  aspectRatio: hdResolution.width / hdResolution.height,
  height: 200
});
```