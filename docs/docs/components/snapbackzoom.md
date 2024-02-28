---
title: Snapback Zoom
description: An ideal component for preview handling
outline: deep
---

# Snapback Zoom

An ideal component for preview handling, as its name suggests it returns to its original position after the pinch gesture ends, you can see this feature being implemented in Telegram's messages containing images and/or videos or Instragram's posts.

The next video is taken from the [Example app](https://github.com/Glazzes/react-native-zoomable/tree/main/example)

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/snapbackzoom.mp4" controls />
</div>

## How to use
Its usage is pretty straight forward, import SnapBackZoom component from `@glazzes/react-native-zoomable` and wrap a component of your choice with it.

::: danger Caution
Do not use `position: "absolute"` directly in the wrapped component by `SnapbackZoom` as it messes up with pinch gesture's measurement, wrap `SnapBackZoom` within a absolute positioned view if you need so
:::

```jsx
import { SnapBackZoom } from "@glazzes/react-native-zoomable"

// Simple use case
<SnapBackZoom>
  <Image // <= This could be an Expo image or a Video
    source={{ uri: IMAGE }}
    style={{ width: 200, height: 200 }}
    resizeMethod={"scale"} // <= Very important for images in Android do not forget it
    resizeMode={"cover"}/>
</SnapBackZoom>

// Complex use case
<SnapBackZoom
  hitSlop={{ vertical: 50, horizontal: 50 }}
  timingConfig={{ duration: 150, easing: Easing.linear }}
  onTap={(e) => console.log(e)}
  onDoubleTap={(e) => console.log(e)}
  onPinchStart={(e) => console.log(e)}
  onPinchEnd={(e) => console.log(e)}
  onGestureActive={(e) => {
    'worklet';
     console.log(e);
  }}
  onGestureEnd={() => console.log('animation finished!')}>
    <Image // <= This could be an Expo image or a Video
      source={{ uri: IMAGE }}
      style={{ width: 200, height: 200 }}
      resizeMethod={"scale"} // <= Very important for images in Android do not forget it
      resizeMode={"cover"}/>
</SnapBackZoom>
```

## Properties
All properties for this component are optional

### hitslop
- Type:  `object`, see [HitSlop](https://docs.swmansion.com/react-native-gesture-handler/docs/gesture-handlers/common-gh/#hitslop)
- Default: `undefined`

Increase the gesture detection area around your component in all directions by a given amount in pixels, useful when dealing with small components

### timingConfig 
- Type: `object`, see [WithTimingConfig](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/#config-)
- Default: `undefined`

Custom [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)'s timing configuration used to snap back to the original position 

### resizeConfig
- Type: [ResizeConfig](#resizeconfig-type)
- Default: `undefined`

Dynamically recalculates `SnapBackZoom` component's `width` and `height` style properties to align with a given `aspect ratio` based on a `scale` value as the gesture scale increases, see [notes](#notes)

### gesturesEnabled
- Type: `boolean`
- Default: `true`

Enables or disable gestures, when gestures are disabled your component can detect pointer events again

### onTap
- Type: `function`
- Default: `undefiend`

Callback triggered when a single tap is made

### onDoubleTap
- Type: `function`
- Default: `undefiend`

Callback triggered when a double tap is made

### onPinchStart
- Type: `function`
- Default: `undefiend`

callback triggered when the pinch gesture starts

### onPinchEnd
- Type: `function`
- Default: `undefiend`

Callback triggered as soon as the user lift their fingers off the screen after pinching

### onGestureActive
- Type: [worklet function](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/)
- Default: `undefined`

Callback triggered from the moment pinch gesture starts until the snap back animation finishes, receives the state of the gesture as argument, which includes the following properties
- `x` position in the x axis starting from the top left corner of the screen
- `y` position in the y axis starting from the top left corner of the screen
- `width` width measurement of your component taken at the start of the pinch gesture
- `height` height measurement of your component taken at the start of the pinch gesture
- `resizedWidth` If resizeConfig property is not `undefined` this represents the current width of your component, otherwise it is `undefined`
- `resizedHeight` If resizeConfig property is not `undefined` this represents the current height of your component, otherwise it is `undefined`
- `translateX` current translateX transformation value
- `translateY` current trasnlateY transformation value
- `scale` current scale transformation value

This property is very useful when you need to mirror the current pinch gesture transformations to some other component.

### onGestureEnd
- Type: `function`
- Default: `undefiend`

Callback triggered once the snap back animation has finished 

## Notes
### On resizeConfig Property
Imagine you've got a lot of images you want to display as tiles of 200x200 pixel size, for many of those images the aspect ratio has been compromised, assume one of those images is 1920x1080 pixel size and you would like this image to resize in such a way the aspect ratio is no longer compromised when the image has been scaled two times by the pinch gesture, your object would look like this

```javascript
{
  size: { width: 200, height: 200 }, // size of your tile
  aspectRatio: 1920 / 1080, // aspect ratio based on the size of your image/video
  scale: 2 // at which scale the aspect ratio is no longer compromised
}
```

::: tip Important
`SnapbackZoom` resizes its own dimensions not your component's ones, remember to use `{width: '100%', height: '100%'}` for images and videos so they cover the entire area of `SnapBackZoom` as it resizes.
:::

At a scale of one your image is a tile of 200x200 pixel size, in other words a square, but at a scale two it resizes to 340x200 pixel size becoming a rectangle matching with the image's aspect ratio.

## Type Definitions
### ResizeConfig Type
```jsx
type ResizeConfig = {
  size: {
    width: number;
    height: number;
  },
  aspectRatio: number;
  scale: number;
}
```
