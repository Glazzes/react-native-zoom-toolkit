---
title: Snapback Zoom
description: An ideal zoom component for preview handling
outline: deep
---

# SnapbackZoom

An ideal component for preview handling, as its name suggests it returns to its original position after the pinch gesture ends, you can see this feature being implemented in Telegram's messages containing images and/or videos or Instragram's posts.

::: warning Beware iOS users
This component will be subject to some level of stuttering, unless you install a version of React Native Gesture Handler greater than equals `2.16.0`.

For more information see this [Gesture Handler's issue](https://github.com/software-mansion/react-native-gesture-handler/issues/2833) and [this issue](https://github.com/Glazzes/react-native-zoom-toolkit/issues/10).
:::

The next video footage represents a complex use case, this one is taken from the [Example app](https://github.com/Glazzes/react-native-zoom-toolkit/tree/main/example)

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/snapbackzoom.mp4" controls />
</div>

## How to use

Its usage is pretty straight forward, just wrap a component of your choice with it.

::: tip Child Componenet Guidelines
SnapbackZoom's child component must be measurable, therefore avoid the following:

- Do not use relative size units like `{width: '100%'}`, use absolute values instead, for instance
  `{width: 200, height: 200}`.
- Do not use `{position: 'absolute'}` style, wrap SnapbackZoom in an absolute positioned view if you need to.
:::

```jsx
import { SnapbackZoom } from "react-native-zoom-toolkit"

// Simple use case
<SnapbackZoom>
  <Image // <= This could be an Expo image or a Video
    source={{ uri: IMAGE }}
    style={{ width: 200, height: 200 }}
    resizeMethod={"scale"} // <= Very important for images in Android do not forget it
    resizeMode={"cover"}/>
</SnapbackZoom>

// Complex use case
<SnapbackZoom
  hitSlop={{ vertical: 50, horizontal: 50 }}
  timingConfig={{ duration: 150, easing: Easing.linear }}
  onTap={(e) => console.log(e)}
  onDoubleTap={(e) => console.log(e)}
  onPinchStart={(e) => console.log(e)}
  onPinchEnd={(e) => console.log(e)}
  onUpdate={(e) => {
    'worklet';
     console.log(e);
  }}
  onGestureEnd={() => console.log('animation finished!')}>
    <Image // <= This could be an Expo image or a Video
      source={{ uri: IMAGE }}
      style={{ width: 200, height: 200 }}
      resizeMethod={"scale"} // <= Very important for images in Android do not forget it
      resizeMode={"cover"}/>
</SnapbackZoom>
```

## Properties

All properties for this component are optional.

### hitslop

| Type     | Default     | Additional Info                                                                                                 |
| -------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| `object` | `undefined` | see [HitSlop](https://docs.swmansion.com/react-native-gesture-handler/docs/gesture-handlers/common-gh/#hitslop) |

Increase (Android only) or decrease the gesture detection area around your component in all directions by a given amount in pixels, useful when dealing with small components.

### timingConfig

| Type     | Default     | Additional Info                                                                                            |
| -------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `object` | `undefined` | see [TimingConfig](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/#config-) |

::: tip Tip
Be realistic with the timing configuration you use as you will not be able to resume the gesture once the
snapback animation has started.
:::

Custom React Native Reanimated's timing configuration used to snap back to the original position.

### resizeConfig

| Type           | Default     |
| -------------- | ----------- |
| `ResizeConfig` | `undefined` |

Dynamically recalculates SnapbackZoom component's width and height to align with a given aspect ratio based on a
scale value as the gesture scale increases, see [About resizeConfig Property](#about-resizeconfig-property) for a detailed example.

### gesturesEnabled

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

Enables or disable all gestures.

### onTap

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: TapGestureEvent) => void` | `undefined` | see [tap gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#event-data) |

Callback triggered when the user taps the wrapped component once.

### onDoubleTap

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: TapGestureEvent) => void` | `undefined` | see [tap gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#event-data) |

Callback triggered when the user taps the wrapped component twice.

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

| Type                                         | Default     | Additional Info                                                                                    |
| -------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(state: SnapbackZoomState<number>) => void` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered from the moment pinch gesture starts until the snap back animation finishes, ideal
if you need to mirror the current state of the gesture to some other component, see [SnapbackZoomState](#snapbackzoomstate).

### onGestureEnd

| Type         | Default     |
| ------------ | ----------- |
| `() => void` | `undefined` |

Callback triggered once the snap back animation has finished.

## About resizeConfig Property

Before you start reading, for a visual reference watch the video above and pay attention to the parrot image.

Imagine you've got a lot of images you want to display as tiles of 200x200 pixel size, for many of those images
the aspect ratio has been compromised, assume one of those images is 1920x1080 pixel size and you would like
this image to resize in such a way the aspect ratio is no longer compromised when the image has been scaled two
times by the pinch gesture, your component will look like this.

```tsx
const resizeConfig = {
  size: { width: 200, height: 200 }, // size of your tile
  aspectRatio: 1920 / 1080, // aspect ratio based on the size of your image/video
  scale: 2 // at which scale the aspect ratio is no longer compromised
}

<SnapbackZoom resizeConfig={resizeConfig}>
  {/* Use width and height properties not flex: 1 */ }
  <SomeImage style={{ width: '100%', height: '100%' }} />
</SnapbackZoom>
```

::: tip Important
Contrary to the child components guidelines mentioned at the start of this page when using `resizeConfig` property
your component must have the following styles `{width: '100%', height: '100%'}`.
:::

At a scale of one your image is a tile of 200x200 pixel size, in other words a square, but at a scale two it resizes to 340x200 pixel size becoming a rectangle matching with the image's aspect ratio.

## Type Definitions

### ResizeConfig

| Property    | type                               | description                                                                   |
| ----------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| size        | `{width: number; height: number;}` | Fields specify the width and height of your component.                        |
| aspectRatio | `number`                           | Aspect ratio of your image/video/component.                                   |
| scale       | `number`                           | At which scale your component will be fully resized to meet the aspect ratio. |

### SnapbackZoomState

| Name            | Type                  | Description                                                                                                                 |
| --------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `x`             | `number`              | Position in the x axis starting from the top left corner of the screen                                                      |
| `y`             | `number`              | Position in the y axis starting from the top left corner of the screen                                                      |
| `width`         | `number`              | Inital width measurement of your component                                                                                  |
| `height`        | `number`              | Inital height measurement of your component                                                                                 |
| `resizedWidth`  | `number \| undefined` | Current width measurement of your component, if `resizeConfig` property is `undefined`, this value will be `undefined` too  |
| `resizedHeight` | `number \| undefined` | Current height measurement of your component, if `resizeConfig` property is `undefined`, this value will be `undefined` too |
| `translateX`    | `number`              | Current translateX transformation value                                                                                     |
| `translateY`    | `number`              | Current translateY transformation value                                                                                     |
| `scale`         | `number`              | Current scale transformation value                                                                                          |
