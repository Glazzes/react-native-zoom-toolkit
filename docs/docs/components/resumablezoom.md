---
title: ResumableZoom
description: A zoomable component designed for detail screens.
outline: deep
---

# ResumableZoom

An ideal and practical component for detail screens, all gestures are resumable and will pick up where you left in your last interaction with the component.

Among its more remarkable features you will find:

- **Pan Gesture:** Drag and your components around in three different modes, optionally let your component slide with a decay animation.
- **Pinch Gesture:** Accurate pinch gesture calculation, drag your component around as you pinch, scale your component in two different modes.
- **Double Tap:** Tap twice in a point of interest to trigger a zoom animation.

The next video footage is taken from the [Example app](https://github.com/Glazzes/react-native-zoom-toolkit/tree/main/example).

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/resumablezoom.mp4" controls />
</div>

## How to use

Its usage is pretty straight forward, just wrap a component of your choice with it, the following example is a full screen image detail component.

::: warning Scrollable Components

ResumableZoom's usage is tailored to detail screens only, if you find yourself in the need of turning ResumableZoom into an scrollable component's child, consider using `Gallery` component instead. 
:::

```jsx
import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import {
  fitContainer,
  ResumableZoom,
  useImageResolution,
} from 'react-native-zoom-toolkit';

const uri =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const App = () => {
  const { width, height } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri });
  if (isFetching || resolution === undefined) {
    return null;
  }

  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  return (
    <ResumableZoom maxScale={resolution}>
      <Image source={{ uri }} style={{ ...size }} resizeMethod={'scale'} />
    </ResumableZoom>
  );
};

export default App;
```

## Properties

All properties for this component are optional.

### style

| Type        | Default       |
| ----------- | ------------- |
| `ViewStyle` | `{ flex: 1 }` |

Styles used by the container enclosing your component. The following styles are enforced by the library and
can not be modified: `{ justifyContent: 'center', alignItems: 'center' }`.

### extendGestures

| Type      | Default |
| --------- | ------- |
| `boolean` | `false` |

By default the gesture detection area is the same size as the width and height of the wrapped component,
by setting this property to `true` the detection area is increased to the size `ResumableZoom` is taking
on screen, see [this picture](/extendgestures.jpg) for a visual reference.

### minScale

| Type     | Default |
| -------- | ------- |
| `number` | `1`     |

Minimum scale value allowed by the pinch gesture, expects values greater than or equals one.

### maxScale

| Type                           | Default |
| ------------------------------ | ------- |
| `SizeVector<number> \| number` | `6`     |

Maximum scale value allowed by the pinch gesture, expects values bigger than or equals one.

Alternatively you can pass the resolution of your image/video, for instance `{ width: 1920, height: 1080 }`;
this will instruct the component to calculate `maxScale` in such a way it's a value just before your content
starts to pixelate.

### panMode

| Type                              | Default   |
| --------------------------------- | --------- |
| `'clamp' \| 'free' \| 'friction'` | `'clamp'` |

Determine how your component must behave when it's panned beyond the specified boundaries by the container
enclosing it, possible values are:

- `clamp` prevents the user from dragging the component out of its enclosing container boundaries.
- `free` lets the user drag the component around freely, if the pan gesture ends in an out of bounds position
  it will animate back to a position within the boundaries of its enclosing container.
- `friction` is the same as `free`mode, however it adds some amount of friction as you pan.

### scaleMode

| Type                  | Default    |
| --------------------- | ---------- |
| `'clamp' \| 'bounce'` | `'bounce'` |

Determine how your component must behave when the pinch gesture's scale value exceeds boundaries
defined by `minScale` and `maxScale` properties, possible values are:

- `clamp` keeps the scale whithin the already mentioned scale boundaries.
- `bounce` lets the user scale above and below the scale boundary values, at the end of the pinch gesture
  the scale value animates back to `minScale` or `maxScale` respectively.

### allowPinchPanning

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

Lets the user pan the component around as they pinch as well as providing a more accurate pinch gesture calculation
to user interaction. Panning as you pinch will not trigger any pan gesture related callbacks.

### pinchMode

| Type                | Default   |
| ------------------- | --------- |
| `'clamp' \| 'free'` | `'clamp'` |

::: tip Requirements
Requires `allowPinchPanning` property is set to `true`.
:::

Determine the behavior used by the pinch gesture relative to the boundaries of its enclosing component,
possible values are:

- `clamp` keeps the pinch gesture clamped to the borders or its enclosing container during the entirity of the
  gesture, just like seen on Android galleries.
- `free` lets the user drag the component out of the container boundaries while pinching, if the pinch gesture was released in an out bonds
  position it will animate back to a position within the bondaries of its enclosing container.

### decay

| Type      | Default | Additional Info                                                                                |
| --------- | ------- | ---------------------------------------------------------------------------------------------- |
| `boolean` | `true`  | see [WithDecay](https://docs.swmansion.com/react-native-reanimated/docs/animations/withDecay/) |

Whether to apply a decay animation when the pan gesture ends or not.

### panEnabled

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

Enables and disables both pan and swipe gestures.

### pinchEnabled

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

Enables and disables the pinch gesture.

### tapsEnabled

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

Enables and disables both single and double tap gestures.

### onTap

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: TapGestureEvent) => void` | `undefined` | see [tap gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#event-data) |

Callback triggered when the user taps the wrapped component once.

### onSwipe

| Type                                                       | Default     |
| ---------------------------------------------------------- | ----------- |
| `(direction: 'up' \| 'down' \| 'left' \| 'right') => void` | `undefined` |

::: tip Requirements
Requires `panMode` property is set to `'clamp'`.
:::

Callback triggered when the user swipes up, down, left or right.

### onPanStart

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: PanGestureEvent) => void` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

Callback triggered when the pan gesture starts.

### onOverPanning

| Type                             | Default     | Additional Info                                                                                    |
| -------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(x: number, y: number) => void` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered when the wrapped component has been panned beyond the boundaries defined by
its enclosing container, receives as an argument the amount the component has been panned beyond such
boundaries in both `x` and `y` axis.

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

### longPressDuration

| Type      | Default |
| --------- | ------- |
| `number`  | `500`   |

Minimum time expressed in milliseconds required to trigger the long press gesture event, expect values greater than 250 to avoid collisions with tap and double tap gestures.

### onLongPress

| Type                                      | Default     | Additional Info                                                                                    |
| ----------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(e: LongPressEvent) => void` | `undefined` | see [long press gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/long-press-gesture/#event-data) |

Callback triggered as soon as the long press gesture starts.

### onUpdate

| Type                                      | Default     | Additional Info                                                                                    |
| ----------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(state: CommonZoomState<number>) = void` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered when the transformation state of the component changes, the internal state is updated as
the user makes use of the gestures or execute its methods, ideal if you need to mirror its current transformation
values to some other component as it updates, see [CommonZoomState](#commonzoomstate).

### onGestureEnd

| Type         | Default     |
| ------------ | ----------- |
| `() => void` | `undefined` |

Callback triggered when a pan, pinch or double tap gesture ends, if an animation started at the end of one
of the gestures the execution of this callback will be delayed until such animation finishes.

## Methods

All methods are accessible through a ref object.

```tsx
import { useRef } from 'react';
import {
  ResumableZoom,
  type ResumableZoomRefType,
} from 'react-native-zoom-toolkit';

const ref = useRef<ResumableZoomRefType>(null);
ref.current?.reset(false);

<ResumableZoom ref={ref}>
  <SomeComponent />
</ResumableZoom>;
```

### getState

Request internal transformation values of this component at the moment of the calling.

- type definition: `() => CommonZoomState<number>`
- return type: [CommonZoomState\<number\>](#commonzoomstate)

### getVisibleRect

Get the coordinates of the current visible rectangle within ResumableZoom's frame.

- type definition: `() => Rect`
- return type: `{x: number, y: number, width: number, height: number}`

### setTransformState

Assign the internal transformation values for this component, if the state you have provided is considered
to be not achievable by the component's boundaries, it'll be approximated to the closest valid state.

- type definition: `(state: CommonTransformState<number>, animate?: boolean) => void`
- parameter information

| Name    | Type                                                          | Description                                                                       |
| ------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| state   | [CommonTransformState\<number\>](#commontransformstate) | Object containg the transformation values to assign to `ResumableZoom` component. |
| animate | `boolean \| undefined`                                        | Whether to animate the transition or not, defaults to `true`.                     |

### reset

Reset all transformations to their initial state.

- type definition: `(animate?: boolean) => void`
- parameter information

| Name    | Type                   | Default | Description                               |
| ------- | ---------------------- | ------- | ----------------------------------------- |
| animate | `boolean \| undefined` | `true`  | Whether to animate the transition or not. |

### zoom

Programmatically zoom in or out to a xy position within the child component.

- type definition: `(newScale: number, position?: Vector<number>) => void`
- parameter information

| Name       | Type             | Description                                                                                                                                                                                                                      |
|------------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| newScale | `number`         | Scale value, this one is clamped between `minScale` and `maxScale`.                                                                                                                                                              |
| position         | `Vector<number> \| undefined` | Position of the point to zoom in or out starting from the top left corner of your component, leaving this value as undefined will be infered as zooming in or out from the center of the child component's current visible area. |

## Type Definitions

### CommonZoomState

| Property        | Type           | Description                                |
|-----------------|----------------|--------------------------------------------|
| `containerSize` | `Size<number>` | Width and height of ResumableZoom.         |
| `childSize`     | `Size<number>` | Width and height of the wrapped component. |
| `maxScale`      | `number`       | Maximum scale allowed by the component.    |
| `translateX`    | `number`       | Current translateX transformation value.   |
| `translateY`    | `number`       | Current translateY transformation value.   |
| `scale`         | `number`       | Current scale transformation value.        |

### CommonTransformState

| Property     | Type     | Description                      |
| ------------ | -------- | -------------------------------- |
| `translateX` | `number` | TranslateX transformation value. |
| `translateY` | `number` | TranslateY transformation value. |
| `scale`      | `number` | Scale transformation value.      |
