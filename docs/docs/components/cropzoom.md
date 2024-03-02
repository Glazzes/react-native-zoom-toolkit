---
outline: deep
---

# Crop Zoom
An ideal, practical and unopinionated component for image and video cropping needs, among its features we can find the following:

- Build your own custom UI on top of it.
- Resumable and accurate zoom features, pan, pinch and even pan with the pinch gesture! It will resume where you left.
- For complex uses cases, use it as an overlay view and mirror its transformation values to some other components, for instance [React Native Skia](https://shopify.github.io/react-native-skia/)'s components.
- Enforce all resulting crops to be a fixed size, ideal for profile pictures.
<br/><br/>

This component has been designed to work seamessly with [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) library for image cropping.

- see [Use Crop Zoom with Expo Image Manipulator](../guides/cropzoomexpo)
<br/><br/>

The next video footage is taken from the [Example app](https://github.com/Glazzes/react-native-zoomable/tree/main/example)
<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/cropzoom.mp4" controls />
</div>

## How to use
TODO

## Properties
All properties for this component are optional unless they are specificed as `Required`

### cropSize
- Type: `{ width: number; height: number; }`
- `Required`


### resolution
- Type: `{ width: number; height: number; }`
- `Required`

Resolution of your image/video or how big whatever you are tying to crop is

### OverlayComponent
- Type: `JSX.Element`
- Default: `undefined`

### onGestureActive
- Type: [worklet function](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/)
- Default: `undefinied`


## Methods
All methods are accesible through a ref object
```jsx
import { useRef } from 'react';
import { CropZoom, Type CropZoomType } from '@glazzes/react-native-zoomable'

const ref = useRef<CropZoomType>(null);
ref.current?.crop(200);

<CropZoom ref={ref} />
```

### crop
Maps all the trasnformations applied to your component by the pinch gesture into a simple and ready to use object specifying the context necessary for a crop operation, such object must be used along with a library capable of cropping images, for instance [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/).
- Arguments

| Name | Type | Default | Description |
|------|------|-------------|---------|
| fixedWidth | `number \| undefined` | `undefined` | Enforce all resulting crops to be of a fixed width, height is infered by the computed aspect ratio of CropZoom's [cropSize](#cropsize) property. |

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
<td>Fields specify if the image/video needs to flipped and to what angle must be rotated.</td>
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
