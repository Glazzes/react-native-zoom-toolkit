---
title: Croop Zoom
description: An ideal and unopinionated component for image and video cropping needs.
outline: deep
---

# CropZoom
An ideal, practical and unopinionated component for image and video cropping needs, among its features we can find the following:

- **Custom UI:** Build your own custom UI on top of it.
- **Resumable:** Resumable and accurate pinch to zoom features; pan, pinch and even pan with the pinch gesture! It will resume where you left.
- **Barebones:** For complex use cases, use it as an overlay view and mirror its transformation values to some other components, for instance [React Native Skia](https://shopify.github.io/react-native-skia/)'s components.
- **Fixed size:** Enforce all resulting crops to be of a fixed size, ideal for profile pictures.

This component comes with a handy algorithm to perform cropping operations for you, however you will need the help a of deidicated library for this task.
- see [Use Crop Zoom with Expo Image Manipulator](../guides/cropzoomexpo) guide.

The next video footage is taken from the [Example app](https://github.com/Glazzes/react-native-zoom-toolkit/tree/main/example).

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/cropzoom.mp4" controls />
</div>

## How to use

### Managed mode
Managed mode is the default mode and its designed for simple use cases as the one shown in the video footage above.

Its usage is pretty straight forward, just wrap a component of your choice with it, however there are some things to keep in mind:

::: tip Remember
- This component uses `flex: 1` style property therefore it will attempt to take all available space, its minimum dimensions are the values provided to `cropSize` property.
- The crop area is centered using `justifyContent` and `alignItems` center.
- This component calculates the dimensions needed to meet the `resolution` property's aspect ratio, therefore your images and videos must use `{ flex: 1 }` style property so they cover the gesture detection area properly.
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
  debug={true}
  cropSize={cropSize} 
  resolution={resolution} 
  OverlayComponent={renderOverlay}
>
  <Image source={{uri: iamgeUrl }} style={{flex: 1}} />
</CropZoom>
```

For a detailed managed mode example, see Example App's [CropZoom Managed Example](https://github.com/Glazzes/react-native-zoomable/blob/dev/example/src/cropzoom/common-example/CropManagedExample.tsx)

### Overlay mode
In contrast to managed mode, overlay mode is designed to provide a barebones component with the very minimum necessary to work for complex use cases; it provides the crop and gesture detection areas only.

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

Select which one of the two available modes to use.

### cropSize
| Type | Required |
|------|----------|
| `{ width: number; height: number; }` | `Yes`    |

Size of the cropping area.

### resolution
| Type | Required |
|------|----------|
| `{ width: number; height: number; }` | `Yes`    |

Resolution of your image, video or how big whatever you are trying to crop really is.

### debug
| Type | Default | Required |
|------|---------|----------|
| `boolean` | `false` | `No`    |

::: tip Note
In case you're color blind and/or have any trouble differentiating colors, please consider opening an issue suggesting a suitable pair of colors.
:::

Highlight the cropping area with a red-ish color as well as the gesture detection area with a light green color, use it to align your `OverlayComponent` with the crop area properly.

### minScale
| Type | Default | Required | 
|------|---------|----------|
| `number` | `1` | `No`     |

Minimum scale value allowed by the pinch gesture, expects values greater than or equals one.

### maxScale
| Type | Default | Required |
|------|---------|----------|
| `number` | `undefined` | `No`    |

Maximum scale value allowed by the pinch gesture, leaving this property as `undefined` will instruct the component to infer the maximum scale value based on `cropSize` and `resolution` properties in a such way `maxScale` is a value just before images and videos start getting pixelated.

### panMode
| Type | Default | Required | Additional Info |
|------|---------|----------|-----------------|
| `PanMode` | `PanMode.FREE` | `No`    | see [PanMode](#panmode-enum) |

Select which one of the three available pan modes to use.

### scaleMode
| Type | Default | Required | Additional Info |
|------|---------|----------|-----------------|
| `ScaleMode` | `ScaleMode.BOUNCE` | `No`    | see [ScaleMode](#scalemode-enum) |

Select which one of the two available scale modes to use.

### allowPinchPanning
| Type | Default | Required |
|------|---------|----------|
| `boolean` | `true` | `No` | 

::: warning Beware iOS users
This feature is disabled by default for iOS users when a version of React Native Gesture Handler prior to `2.16.0` is installed, installing a version greater than equals `2.16.0` will set the value of this property to `true` by default.

For more information see this [Gesture Handler's issue](https://github.com/software-mansion/react-native-gesture-handler/issues/2833) and [this issue](https://github.com/Glazzes/react-native-zoom-toolkit/issues/10).
:::

Lets the user drag the component around as they pinch, it also provides a more accurate pinch gesture calculation at the cost of a subtle "staircase feeling", disable for a smoother but less accurate experience.

This feature is not associated with a pan gesture, therefore it won't trigger `onPanStart` and `onPanEnd` callbacks while you pinch.

### onTap
| Type | Default | Additional Info |
|------|---------|-----------------|
| `(e: TapGestureEvent) => void` | `undefined` | see [tap gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#event-data) |

Callback triggered when the user taps the wrapped component once.

### onPanStart
| Type | Default | Additional Info |
|------|---------|-----------------|
| `(e: PanGestureEvent) => void` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

Callback triggered when the pan gesture starts.

### onPanEnd
| Type | Default | Additional Info |
|------|---------|-----------------|
| `(e: PanGestureEvent) => void` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

Callback triggered as soon as the user lifts their finger off the screen.

### onPinchStart
| Type | Default | Additional Info |
|------|---------|-----------------|
| `(e: PinchGestureEvent) => void` | `undefined` | see [pinch gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture#event-data) |

Callback triggered when the pinch gesture starts.

### onPinchEnd
| Type | Default | Additional Info |
|------|---------|-----------------|
| `(e: PinchGestureEvent) => void` | `undefined` | see [pinch gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture#event-data) |

Callback triggered as soon as the user lifts their fingers off the screen after pinching.

### onGestureActive
| Type | Default | Required | Additional Info |
|------|---------|----------|----------------|
| `(state: CropZoomState) => void` | `undefined` | `No`    | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered when the internal state of the component changes, the internal state is updated as the user makes use of the gestures or execute its [methods](#methods), ideal if you need to mirror its current transformation values to some other component as it updates, see [CropZoomState](#cropzoomstate).

### onGestureEnd
| Type | Default | Required |
|------|---------|----------|
| `() => void` | `undefined` | `No` |

Callback triggered when a pan gesture or a pinch gesture ends, if the gesture finished when the wrapped component was not in bounds, this one will wait for the snapback animation to end.

### OverlayComponent
| Type | Default | Required |
|------|---------|----------|
| `function` | `undefined` | `No`    |

::: tip Condition
- Only visible if the `mode` property is set to `CropMode.MANAGED` (default value).
:::

A function that returns a React Component, such component will sit between your desired component to crop and the gesture detector, for instance you can pass an svg component with a hole in it.


## Methods
All methods are accessible through a ref object.

```jsx
import { useRef } from 'react';
import { CropZoom, type CropZoomType } from 'react-native-zoom-toolkit'

const ref = useRef<CropZoomType>(null);
ref.current?.crop(200);

<CropZoom ref={ref} />
```

### crop
Map all the transformations applied to your component into a simple and ready to use object specifying the context necessary for a crop operation, such object must be used along with a library capable of cropping images and/or videos, for instance Expo Image Manipulator, see [Use Crop Zoom with Expo Image Manipulator](../guides/cropzoomexpo) guide.

- Arguments

| Name | Type | Default | Description |
|------|------|-------------|---------|
| fixedWidth | `number \| undefined` | `undefined` | Enforce all resulting crops to be of a fixed width, height is inferred by the computed aspect ratio of CropZoom's `cropSize` property. |

- Returns [CropContextResult](#cropcontextresult)

::: warning Beware
If you call this method with the `fixedWidth` argument, resulting crops may be subject to one pixel margin of error, this is an intentional behavior in order to prevent some image cropping libraries from crashing your app.
:::

### rotate
Rotate the component 90 degrees clockwise in a range from 0 to 360 degrees.
- Arguments

| Name | Type | Default |Description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |
| cb      | `function \| undefined` | `undefined` | Callback to trigger at the beginning of the transition, as its only argument receives the angle your component will transition to, this angle ranges from 0 to 360 degrees (at 360 degrees it's clamped to 0). |

- Returns `void`

### rotateWithDirection
Rotate the component 90 degrees (or -90 degrees) clockwise or counterclockwise in a range from 0 to 360 degrees (or 0 to -360 degrees).
- Arguments

| Name | Type | Default |Description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |
| clockwise | `boolean \| undefined` | `true` | Whether to rotate clockwise (90 degrees) or counterclockwise (-90 degrees) |
| cb      | `function \| undefined` | `undefined` | Callback to trigger at the beginning of the transition, as its only argument receives the angle your component will transition to, this angle ranges from 0 to 360 degrees (or -360 degrees) (at 360 or -360 degrees it's clamped to 0). |

- Returns `void`

### flipHorizontal
Flip the component horizontally.
- Arguments

| Name | Type | Default |Description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |
| cb      | `function \| undefined` | `undefined` | Callback to trigger at the beginning of the transition, as its only argument receives the angle your component will transition to, values are 0 or 180. |

- Returns `void`

### flipVertical
Flip the component vertically.
- Arguments

| Name | Type | Default |Description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |
| cb      | `function \| undefined` | `undefined` | Callback to trigger at the beginning of the transition, as its only argument receives the angle your component will transition to, values are 0 or 180. |

- Returns `void`

### reset
Reset all transformations to their initial state.
- Arguments

| Name | Type | Default |Description |
|------|------|---------|------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |

- Returns `void`

### requestState
Request internal transformation values of this component at the moment of the calling.

- Takes no arguments
- Returns [CropZoomState](#cropzoomstate)

### assignState
Assign the internal transformation values for this component, if the state you have provided is considered to be not achievable by the component's boundaries, it'll be approximated to the closest valid state.

- Arguments

| Name | Type |Description |
|------|------|------------|
| state   | [CropZoomAssignableState](#cropzoomassignablestate) | Object containg the transformation values to assign to `CropZoom` component. |
| animate | `boolean \| undefined` | Whether to animate the transition or not, defaults to `true`. |

- Returns `void`

## Type Definitions

### CropZoomState
| Name | Type    | Description |
|------|---------|-------------|
| `width` | `number` | Current width of the wrapped component. |
| `height`| `number` | Current height of the wrapped component. |
| `translateX` | `number` | Current translateX transformation value. |
| `translateY` | `number` | Current translateY transformation value. |
| `rotate`     | `number` | Current rotate transformation value, angle is measured in radians. |
| `rotateX`    | `number` | Current rotateX transformation value, angle is measured in radians. |
| `rotateY`    | `number` | Current rotateY transformation value, angle is measured in radians. |

### CropZoomAssignableState
| Name | Type    | Description |
|------|---------|-------------|
| `translateX` | `number` | TranslateX transformation value. |
| `translateY` | `number` | TranslateY transformation value. |
| `rotate`     | `number` | Rotate transformation value, angle measured in radians. |
| `rotateX`    | `number` | RotateX transformation value, angle measured in radians. |
| `rotateY`    | `number` | RotateY transformation value, angle measured in radians. |

### CropMode Enum

| Property |Description |
|----------|------------|
| `MANAGED`| Mode designed for common uses cases, see [How to use](#managed-mode). |
| `OVERLAY`| Mode designed for complex use cases, it provides a barebones component, see [How to use](#overlay-mode). |

### PanMode Enum
Determines how your component must behave when it reaches the specified boundaries by the cropping area.

| Property |Description |
|----------|------------|
| `CLAMP`  | Prevents the user from dragging the component out of the specified boundaries. |
| `FREE`   | Lets the user drag the component around freely, when the pan gesture ends the component will return to a position within the specified boundaries. |
| `FRICTION` | Lets the user drag the component around applying friction to the pan gesture up to a point where it's stopped completely, when the pan gesture ends the component will return to a position within the specified boundaries. |

### ScaleMode Enum
Determine how your component must behave when the pinch gesture's scale value exceeds the specified boundaries by `minScale` and `maxScale` properties.

| Property |Description |
|----------|------------|
| `CLAMP`  | Prevents the scale from exceeding the scale boundaries. |
| `BOUNCE` | Lets the user scale above and below the scale boundary values, when the pinch gesture ends the scale value returns to `minScale` or `maxScale` respectively. |

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
