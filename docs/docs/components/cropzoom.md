---
title: CroopZoom
description: An ideal and unopinionated component for image and video cropping needs.
outline: deep
---

# CropZoom
An ideal, practical and unopinionated component for image and video cropping needs, among its features we can find the following:

- Build your own custom UI on top of it.
- Resumable and accurate pinch to zoom features; pan, pinch and even pan with the pinch gesture! It will resume where you left.
- For complex use cases, use it as an overlay view and mirror its transformation values to some other components, for instance [React Native Skia](https://shopify.github.io/react-native-skia/)'s components.
- Enforce all resulting crops to be of a fixed size, ideal for profile pictures.

This component comes with a handy algorithm to perform cropping operations for you, however you will need the help a of deidicated library for this task.
- see [Use Crop Zoom with Expo Image Manipulator](../guides/cropzoomexpo)

The next video footage is taken from the [Example app](https://github.com/Glazzes/react-native-zoomable/tree/main/example).

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/cropzoom.mp4" controls />
</div>

## How to use

### Managed mode
Managed mode is the default mode and its designed for simple use cases as the one shown in the video footage above.

Its usage is pretty straight forward, just wrap a component of your choice with it, however there are some things to keep in mind:

::: tip Tip
- This component uses `flex: 1` style property therefore it will take all available space, its minimum dimensions are the values provided to `cropSize` property.
- This component calculates the dimensions needed to meet the `resolution` property's aspect ratio, therefore your images and videos must use the style `{width: '100%', height: '100%'}` properties so they cover the gesture detection area properly.
:::

```jsx
import {Image} from 'react-native';
import {CropZoom, useImageResolution, type CropZoomType} from 'react-native-zoom-toolkit`;

const imageUrl = 'url to some image';
const cropSize = {width: 200, height: 200};

// A reference so you can access all methods
const ref = useRef<CropZoomType>(null);

// Utility hook to get the resolution of a network image
const { resolution } = useImageResolution({uri: imageUrl });

// A function that renders an svg with a hole in it.
const renderOverlay = () => <SomeComponent />

if(resolution === undefined) {
  return null;
}

<CropZoom 
  ref={ref}
  cropSize={cropSize} 
  resolution={resolution} 
  OverlayComponent={renderOverlay}>
  <Image 
    source={{uri: iamgeUrl }} 
    style={{width: '100%', height: '100%'}} />
</CropZoom>
```

For a detailed managed mode example, see Example App's [CropZoom Managed Example](https://github.com/Glazzes/react-native-zoomable/blob/dev/example/src/cropzoom/common-example/CropManagedExample.tsx)

### Overlay mode
In constrast to managed mode, overlay mode is designed to provide a barebones component with the very minimum necessary to work for complex use cases; it provides the crop and gesture detection areas only.

There are some things to keep in mind

::: tip Remember
- You lose access to `OverlayComponent` and `children` properties.
- The dimensions for this component are the values passed to `cropSize` property.
- Use the `debug` property so you can see the crop and gesture detection areas as you develop.
- Create your own [shared values](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation#defining-a-shared-value) and update them with `onGestureActive` worklet callback.
:::

For an overlay mode example, see Example App's [CropZoom Skia Example](https://github.com/Glazzes/react-native-zoomable/tree/dev/example/src/cropzoom/skia-example)

## Properties

### mode
| Type | Default | Required | Additional Info |
|------|---------|----------|-----------------|
| `CropMode` | `CropMode.MANAGED` | `No`   | see [CropMode](#cropmode-enum) |

Selects which mode to use.

### cropSize
| Type | Required |
|------|----------|
| `{ width: number; height: number; }` | `Yes`    |

Size of the cropping area.

### resolution
| Type | Required |
|------|----------|
| `{ width: number; height: number; }` | `Yes`    |

Resolution of your image/video or how big whatever you are trying to crop really is.

### debug
| Type | Default | Required |
|------|---------|----------|
| `boolean` | `false` | `No`    |

Highlights the cropping area with a red-ish color as well as the gesture detection area with a light green color, this property is meant to be used when `mode` property is set to `CropMode.OVERLAY` so you can align your underlying component with it properly.

::: tip Note
In case you're color blind and/or have any trouble differentiating colors, please consider opening an issue suggesting a suitable pair of colors.
:::

### minScale
| Type | Default | Required | 
|------|---------|----------|
| `number` | `1` | `No`     |

Minimum scale value allowed by the pinch gesture, expects values greater than or equals one.

### maxScale
| Type | Default | Required |
|------|---------|----------|
| `number` | `-1` | `No`    |

Maximum scale value allowed by the pinch gesture, negative values instruct the component to infer the maximum scale value based on `cropSize` and `resolution` properties in a such way max scale is a value just before images and videos start getting pixelated.

### panMode
| Type | Default | Required | Additional Info |
|------|---------|----------|-----------------|
| `PanMode` | `PanMode.FREE` | `No`    | see [PanMode](#panmode-enum) |

Which one of the three available pan modes to use.

### scaleMode
| Type | Default | Required | Additional Info |
|------|---------|----------|-----------------|
| `ScaleMode` | `ScaleMode.BOUNCE` | `No`    | see [ScaleMode](#scalemode-enum) |

Which one of the two available scale modes to use.

### panWithPinch
| Type | Default | Required |
|------|---------|----------|
| `boolean` | `true` | `No`    |

Lets the user drag the component around as they pinch, it also provides a more accurate pinch gesture calculation at the cost of a subtle staircase feeling.

### onGestureActive
| Type | Default | Required | Addtional Info |
|------|---------|----------|----------------|
| `worklet function` | `undefined` | `No`    | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Callback triggered as the user interacts with the component, it does also mean interacting through its [methods](#methods), ideal if you need to mirror the internal state of the component to some other component as it updates.

As an argument receives the internal state of the component, with includes the following properties:
| Name | Type    | Description |
|------|---------|-------------|
| `width` | `number` | Current width of the gesture detection area |
| `height`| `number` | Current height of the gesture detection area |
| `translateX` | `number` | Current translateX transformation value |
| `translateY` | `number` | Current translateY transformation  value |
| `rotate`     | `number` | Current rotate transformation value, angle is measured in radians |
| `rotateX`    | `number` | Current rotateX transformation value, angle is measured in radians |
| `rotateY`    | `number` | Current rotateY transformation value, angle is measured in radians |

### OverlayComponent
| Type | Default | Required |
|------|---------|----------|
| `function` | `undefined` | `No`    |

A function that returns a React Component, such component will sit between your desired component to crop and the gesture detector, for instance you can pass an svg component with a "hole" in it.

Previous condition: `mode` property is set to `CropMode.MANAGED` (default value).


## Methods
All methods are accessible through a ref object
```jsx
import { useRef } from 'react';
import { CropZoom, type CropZoomType } from 'react-native-zoom-toolkit'

const ref = useRef<CropZoomType>(null);
ref.current?.crop(200);

<CropZoom ref={ref} />
```

### crop
Maps all the transformations applied to your component into a simple and ready to use object specifying the context necessary for a crop operation, such object must be used along with a library capable of cropping images and/or videos, for instance [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/).
- Arguments

| Name | Type | Default | Description |
|------|------|-------------|---------|
| fixedWidth | `number \| undefined` | `undefined` | Enforce all resulting crops to be of a fixed width, height is inferred by the computed aspect ratio of CropZoom's `cropSize` property. |

- Returns
[CropContextResult](#cropcontextresult)

### rotate
Rotates the component 90 degrees clockwise in a range from 0 to 360 degrees.
- Arguments

| Name | Type | Default |Description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |

### flipHorizontal
Flips the component horizontally.
- Arguments

| Name | Type | Default |Description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |

### flipVertical
Flips the component vertically.
- Arguments

| Name | Type | Default |Description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |

### reset
Resets all transformations to their initial state.
- Arguments

| Name | Type | Default |Description |
|------|------|---------|------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |

## Type Definitions
### CropMode Enum

| Property |Description |
|----------|------------|
| `MANAGED`| Mode designed for common uses cases, see [How to use](#managed-mode) |
| `OVERLAY`| Mode designed for complex use cases, it provides a barebones component, see [How to use](#overlay-mode) |

### PanMode Enum
Determines how your component must behave when it reaches the specified boundaries by the cropping area.

| Property |Description |
|----------|------------|
| `CLAMP`  | Prevents the user from dragging the component out of the specified boundaries. |
| `FREE`   | Lets the user drag the component around freely, when the pan gesture ends the component will return to a position within the specified boundaries. |
| `FRICTION` | Lets the user drag the component around applying friction to the pan gesture up to a point where it's stopped completely, when the pan gesture ends the component will return to a position within the specified boundaries. |

### ScaleMode Enum
Determines how your component must behave when it reaches the specified boundaries by `minScale` and `maxScale` properties.

| Property |Description |
|----------|------------|
| `CLAMP`  | Prevents the scale from going above and below the scale threshold. |
| `BOUNCE` | Lets the user scale above and below the scale threshold values, when the pinch gesture ends the scale value returns to `minScale` or `maxScale`. |

### CropContextResult

<table>
<tr>
    <th>Property</th>
    <th>Type</th>
    <th>Description</th>
</tr>

<tr>
<td>crop</td>
<td>

```typescript
{
  originX: number; 
  originY: number; 
  width: number; 
  height: number;
}
```
</td>
<td>Fields specify the top left corner and size of the crop.</td>
</tr>

<tr>
<td>context</td>
<td>

```typescript
{
  rotationAngle: number; 
  flipHorizontal: boolean; 
  flipVertical: boolean;
}
```
</td>
<td>Fields specify if the image/video needs to flipped and to what angle must be rotated, the angle is measured in degrees.</td>
</tr>

<tr>
<td>resize</td>
<td>

```typescript
{
  width: number; 
  height: number; 
} | undefined
```
</td>
<td>
Fields specify the size your image/video must be resized to before cropping, if this property is undefined it means no resizing is necessary. <br/><br/> This property is always undefined if you call <a href="#crop">crop method</a> without fixedWidth argument.
</td>
</tr>

</table>
