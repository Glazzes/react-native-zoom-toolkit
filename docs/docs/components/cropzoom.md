---
title: Croop Zoom
description: An ideal and unopinionated component for image and video cropping needs.
outline: deep
---

# CropZoom

An ideal, practical and unopinionated component for image and video cropping needs, among its features
we can find the following:

- **Custom UI:** Build your own custom UI on top of it.
- **Resumable:** Resumable and accurate pinch to zoom features; pan, pinch and even pan with the pinch gesture! It will resume where you left.
- **Barebones:** For complex use cases, use it as an overlay view and mirror its transformation values to some other components, for instance React Native Skia's components.
- **Fixed size:** Enforce all resulting crops to be of a fixed size, ideal for profile pictures.

This component comes with a handy algorithm to perform cropping operations for you, however you will need the
help a of deidicated library for this task.

- see [CropZoom and Expo Image Manipulator](../guides/cropzoomexpo) guide.

The next video footage is taken from the [Example app](https://github.com/Glazzes/react-native-zoom-toolkit/tree/main/example).

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/cropzoom.mp4" controls />
</div>

## How to use

It's usage is quite similar to the one of ResumableZoom component, reading [CropZoom and Expo Image Manipulator](../guides/cropzoomexpo)
guide is highly advised for a better understanding of this component's usage, however here is a pseudo-example of
its usage:

::: tip Remember

- This component uses `flex: 1` style property therefore it will attempt to take all available space, its
  minimum dimensions are the values provided to cropSize property.
- Child component must use the following styles `{width: 100%, height: '100%'}`.
  :::

```tsx
import { Image, View, StyleSheet } from 'react-native';
import { CropZoom, useImageResolution, type CropZoomType } from 'react-native-zoom-toolkit`;

const imageUrl = 'url to some image';
const cropSize = { width: 200, height: 200 };

const App = () => {
  // A reference so you can access all methods
  const ref = useRef<CropZoomType>(null);

  // Utility hook to get the resolution of a network image
  const { resolution } = useImageResolution({uri: imageUrl });

  // A function that renders an svg with a hole in it.
  const renderOverlay = () => <SomeComponent />

  if(resolution === undefined) {
    return null;
  }

  return (
    <CropZoom
      ref={ref}
      cropSize={cropSize}
      resolution={resolution}
      OverlayComponent={renderOverlay}
    >
      <Image source={{uri: iamgeUrl }} style={{ width: '100%', height: '100%' }} />
    </CropZoom>
  );
}

export default App;
```

## Properties

### cropSize

| Type                                 | Required |
| ------------------------------------ | -------- |
| `{ width: number; height: number; }` | `Yes`    |

Size of the cropping area.

### resolution

| Type                                 | Required |
| ------------------------------------ | -------- |
| `{ width: number; height: number; }` | `Yes`    |

Resolution of your image, video or how big whatever you are trying to crop really is.

### OverlayComponent

| Type                       | Default     | Required |
| -------------------------- | ----------- | -------- |
| `() => React.ReactElement` | `undefined` | `No`     |

A function that returns a component, such component will be located on top of the component to crop and below
the gesture detection area, for instance you can pass an svg component with a hole in it.

### minScale

| Type     | Default | Required |
| -------- | ------- | -------- |
| `number` | `1`     | `No`     |

Minimum scale value allowed by the pinch gesture, expects values greater than or equals one.

### maxScale

| Type     | Default     | Required |
| -------- | ----------- | -------- |
| `number` | `undefined` | `No`     |

Maximum scale value allowed by the pinch gesture, if the value is `undefined` maxScale value will be infered
based on `cropSize` and `resolution` properties in a such way maxScale is a value just before your content
starts to pixelate.

### panMode

| Type                              | Default   | Required |
| --------------------------------- | --------- | -------- |
| `'clamp' \| 'free' \| 'friction'` | `'clamp'` | `No`     |

Determine how your component must behave when it's panned beyond the specified boundaries by the container
enclosing it, possible values are:

- `clamp` prevents the user from dragging the component out of its enclosing container boundaries.
- `free` lets the user drag the component around freely, if the pan gesture ends in an out of bounds position
  it will animate back to a position with the boundaries of its enclosing container.
- `friction` is the same as `free`mode, however it just adds some amount of friction as you pan.

### scaleMode

| Type                  | Default    | Required |
| --------------------- | ---------- | -------- |
| `'clamp' \| 'bounce'` | `'bounce'` | `No`     |

Determine how your component must behave when the pinch gesture's scale value exceeds boundaries
defined by `minScale` and `maxScale` properties, possible values are:

- `clamp` keeps the scale whithin the already mentioned scale boundaries.
- `bounce` lets the user scale above and below the scale boundary values, at the end of the pinch gesture
  the scale value animates back to `minScale` or `maxScale` respectively.

### allowPinchPanning

| Type      | Default | Required |
| --------- | ------- | -------- |
| `boolean` | `true`  | `No`     |

::: warning Beware iOS users
This feature is disabled by default for iOS users when a version of React Native Gesture Handler prior to `2.16.0` is installed, installing a version greater than equals `2.16.0` will set the value of this property to `true` by default.

For more information see this [Gesture Handler's issue](https://github.com/software-mansion/react-native-gesture-handler/issues/2833) and [this issue](https://github.com/Glazzes/react-native-zoom-toolkit/issues/10).
:::

Lets the user pan the component around as they pinch as well as providing a more accurate pinch gesture calculation
to user interaction. Panning as you pinch will not trigger any pan gesture related callbacks.

### onTap

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: TapGestureEvent) => void` | `undefined` | see [tap gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#event-data) |

Callback triggered when the user taps the wrapped component once.

### onPanStart

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: PanGestureEvent) => void` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

Callback triggered when the pan gesture starts.

### onPanEnd

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: PanGestureEvent) => void` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

Callback triggered as soon as the user lifts their finger off the screen.

### onPinchStart

| Type                             | Default     | Additional Info                                                                                                                |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `(e: PinchGestureEvent) => void` | `undefined` | see [pinch gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture#event-data) |

Callback triggered when the pinch gesture starts.

### onPinchEnd

| Type                             | Default     | Additional Info                                                                                                                |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `(e: PinchGestureEvent) => void` | `undefined` | see [pinch gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture#event-data) |

Callback triggered as soon as the user lifts their fingers off the screen after pinching.

### onUpdate

| Type                             | Default     | Required | Additional Info                                                                                    |
| -------------------------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------- |
| `(state: CropZoomState) => void` | `undefined` | `No`     | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered when the transformation state of the component changes, the internal state is updated as
the user makes use of the gestures or execute its methods, ideal if you need to mirror its current transformation
values to some other component as it updates, see [CropZoomState](#cropzoomstate).

### onGestureEnd

| Type         | Default     | Required |
| ------------ | ----------- | -------- |
| `() => void` | `undefined` | `No`     |

Callback triggered when a pan or pinch gesture ends, if an animation started at the end of one
of the gestures this callback's execution will be delayed until the animation has finished.

## Methods

All methods are accessible through a ref object.

```tsx
import { useRef } from 'react';
import { CropZoom, type CropZoomType } from 'react-native-zoom-toolkit';

const ref = useRef<CropZoomType>(null);
ref.current?.crop(200);

<CropZoom ref={ref} />;
```

### crop

Map all the transformations applied to your component into an object describing the context necessary to perform
a crop operation, such object must be used along with a library capable of cropping images and/or videos, for instance
Expo Image Manipulator, see [CropZoom and Expo Image Manipulator](../guides/cropzoomexpo).

- type definition: `(fixedWidth?: number) => CropContextResult`
- parameter information

| Name       | Type                  | Default     | Description                                                                                                                            |
| ---------- | --------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| fixedWidth | `number \| undefined` | `undefined` | Enforce all resulting crops to be of a fixed width, height is inferred by the computed aspect ratio of CropZoom's `cropSize` property. |

- return type: [CropContextResult](#cropcontextresult)

::: warning Beware
Calling crop method with the `fixedWidth` argument will subject your crops to one pixel margin of error,
this behavior is intentional in order to prevent image cropping libraries from crashing your app.
:::

### rotate

Rotate the component 90 degrees clockwise or counterclockwise in a range from 0 to 360 degrees
(or 0 to -360 degrees counterclockwise).

- type definition: `(animate?: boolean, clockwise?: boolean, cb?: (angle: number) => void) => void`
- paramter information

| Name      | Type                    | Default     | Description                                                                                                                                                                                                                                                 |
| --------- | ----------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| animate   | `boolean \| undefined`  | `true`      | Whether to animate the transition or not.                                                                                                                                                                                                                   |
| clockwise | `boolean \| undefined`  | `true`      | Whether to rotate clockwise (90 degrees) or counterclockwise (-90 degrees)                                                                                                                                                                                  |
| cb        | `function \| undefined` | `undefined` | Callback triggered at the beginning of the transition, as its only argument receives the angle your component will transition to, this angle ranges from 0 to 360 degrees (or -360 degrees if counterclockwise) (at 360 or -360 degrees it's clamped to 0). |

### flipHorizontal

Flip the component horizontally.

- type definition: `(animate?: boolean, cb?: (angle: number) => void) => void`
- parameter information

| Name    | Type                    | Default     | Description                                                                                                                                             |
| ------- | ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| animate | `boolean \| undefined`  | `true`      | Whether to animate the transition or not.                                                                                                               |
| cb      | `function \| undefined` | `undefined` | Callback to trigger at the beginning of the transition, as its only argument receives the angle your component will transition to, values are 0 or 180. |

### flipVertical

Flip the component vertically.

- type definition: `(animate?: boolean, cb?: (angle: number) => void) => void`
- parameter information

| Name    | Type                    | Default     | Description                                                                                                                                             |
| ------- | ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| animate | `boolean \| undefined`  | `true`      | Whether to animate the transition or not.                                                                                                               |
| cb      | `function \| undefined` | `undefined` | Callback to trigger at the beginning of the transition, as its only argument receives the angle your component will transition to, values are 0 or 180. |

### reset

Reset all transformations to their initial state.

- type definition: `(animate:? boolean) => void`
- parameter information:

| Name    | Type                   | Default | Description                               |
| ------- | ---------------------- | ------- | ----------------------------------------- |
| animate | `boolean \| undefined` | `true`  | Whether to animate the transition or not. |

### requestState

Request internal transformation values of this component at the moment of the call.

- type definition `() => CropZoomState`
- return type [CropZoomState](#cropzoomstate).

### assignState

Assign the internal transformation values for this component, if the state provided is considered to be not achievable by the component's boundaries, it'll be approximated to the closest valid state.

- type definition: `(state: CropAssignableState, animate?: boolean) => void`
- parameter information

| Name    | Type                                            | Description                                                                  |
| ------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| state   | [CropAssignableState](#cropzoomassignablestate) | Object describing the transformation values to assign to CropZoom component. |
| animate | `boolean \| undefined`                          | Whether to animate the transition or not, defaults to `true`.                |

## Type Definitions

### CropZoomState

| Name         | Type     | Description                                                         |
| ------------ | -------- | ------------------------------------------------------------------- |
| `width`      | `number` | Current width of the wrapped component.                             |
| `height`     | `number` | Current height of the wrapped component.                            |
| `translateX` | `number` | Current translateX transformation value.                            |
| `translateY` | `number` | Current translateY transformation value.                            |
| `rotate`     | `number` | Current rotate transformation value, angle is measured in radians.  |
| `rotateX`    | `number` | Current rotateX transformation value, angle is measured in radians. |
| `rotateY`    | `number` | Current rotateY transformation value, angle is measured in radians. |

### CropAssignableState

| Name         | Type     | Description                                              |
| ------------ | -------- | -------------------------------------------------------- |
| `translateX` | `number` | TranslateX transformation value.                         |
| `translateY` | `number` | TranslateY transformation value.                         |
| `rotate`     | `number` | Rotate transformation value, angle measured in radians.  |
| `rotateX`    | `number` | RotateX transformation value, angle measured in radians. |
| `rotateY`    | `number` | RotateY transformation value, angle measured in radians. |

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
