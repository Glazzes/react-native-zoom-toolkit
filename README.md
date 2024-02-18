
<div>
  <h1 align="center">React Native Zoomable</h1>
</div>

> [!WARNING]
> This library is a work in progress in order to deliver a better pinch to zoom experience to the React Native community.

<div>
  <h4 align="center">A tool-kit for common pinch to zoom feature requirements</h4>
</div>

## Table of contents
- [Movitation](#motivation)
- [Features](#features)
- [Installation](#installation)
- API
  - [SnapBackZoom](#snapbackzoom)
  - ResumableZoom
  - Utilities
- [License](#license) 
 
## Motivation
Pinch to zoom is a must have feature for any application that displays images to the user, this one can be found in a wide variety of use cases:
- Zooming in media contained a chat message
- Detail screens
- Cropping an image or video
- Image galeries

The idea behind this library is to provide a set of components and utilities for the most common use cases of the Pinch to Zoom interaction.

## Features
- **Limitless**: Smoothly zoom in and out any component you want, you're not limited to images only.
- **Performance:** This libray has been written with `Reanimated v3 (v2 compatible)` and `Geture Handler v2`
- **SnapBack Zoom:** Zoom in and snap back, this component automatically snap backs to its original position once the gesture ends, making it ideal for zoomable previews.
- **Resumable Zoom**: Pick up where you left last time! This component remembers your previous interactions with it, just the same way it works in your Android/IOS OS integrated gallery application, making it ideal for detail screens.
- **Expo Go Compatible**: This library has been written in typescript and supported modules by the expo go app. 

## Installation
> [!IMPORTANT]
> This library relies on both Reanimated and Gesture Handler being part of your project, if you do not have them installed already please refer to [Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) and [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation) installation guides.

Install `@glazzes/react-native-zoomable` in your project

```sh
npm install @glazzes/react-native-zoomable
```

```sh
yarn add @glazzes/react-native-zoomable
```
No additional setup is required.

## API

#### SnapBackZoom
As its name suggests, it returns to its original position after the pinch gesture ends, this is very useful when dealing with previews of some sort, for instance how Telegram does it for chat messages containing images or Instagram for post previews. 

Its usage is pretty straight forward, import `SnapBackZoom` component from `@glazzes/react-native-zoomable` and wrap a component of your choice with it, for instance:

```jsx
import { SnapBackZoom } from "@glazzes/react-native-zoomable"

{/* Simplest use case */}
<SnapBackZoom>
  <Image {/* <= This could be an Expo image or a Video */}
    source={{ uri: IMAGE }}
    style={{ width: 200, height: 200 }}
    resizeMethod={"scale"} {/* Very important for images in Android do not forget it */}
    resizeMode={"cover"}/>
</SnapBackZoom>

{/* Complex use case */}
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
    <Image {/* <= This could be an Expo image or a Video */}
      source={{ uri: IMAGE }}
      style={{ width: 200, height: 200 }}
      resizeMethod={"scale"} {/* Very important for images in Android do not forget it */}
      resizeMode={"cover"}/>
</SnapBackZoom>
```

#### Properties
| Property        | Type     | Default                        | Description                                                                                                                                                                                                                                                          |
| --------------- | -------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hitslop         | object   | undefined | increases the gesture detection area around your component in all directions by a given amount in pixels, useful when dealing with small components, see [hitslop](https://docs.swmansion.com/react-native-gesture-handler/docs/gesture-handlers/common-gh/#hitslop) |
| timingConfig    | object   | undefined                      | custom Reanimated's timing configirutation used to snap back to the original position, see [timing config](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/#config-)                                                                                |
| resizeConfig    | object   | undefined                      | dynamically recalculate the `ResetableZoom` component's `width` and `height` style properties to align with a given `aspect ratio` based on a `scale` value as the gesture scale increases, see [notes](#snapbackzooms-notes).                                                            |
| gesturesEnabled | boolean  | true                           | enables or disables gestures, when gestures are disabled your component can detect pointer events again  |
| onTap           | function | undefined                      | callback fired when a single tap is made                                                                                                                                                                                                                             |
| onDoubleTap     | function | undefined                      | callback fired when a double tap is made                                                                                                                                                                                                                             |
| onPinchStart    | function | undefined                      | callback fired when the pinch gesture starts                                                                                                                                                                                                                         |
| onPinchEnd      | function | undefined                      | callback fired as soon as the user lift their fingers off the screen after pinching |
| onGestureActive | function | undefined                      | [worklet function](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) fired from the moment pinch gesture starts until the snap back animation finishes, as argument it receives the state of the gesture which includes position in `x` and `y`, initial `width` and `height`, resized `width` and `height` if `resizedConfig` is used, `translateX`, `translateY` and `scale` values, useful when you want to mirror the current pinch gesture to some other component |
| onGestureEnd    | function | undefined                      | callback fired once the snap back animation has finished                                                                                                                                                                                             |
#### SnapBackZoom's Notes

**resizeConfig:** everything is better with an example, imagine you have a lot of images you want to render as tiles of 200x200 pixel size, for many of those images the aspect ratio has been compromised, assume one of those images is 1920x1080 pixel size and you would like this image to resize in a way the aspect ratio is no longer compromised when the image has been scaled two times by the pinch gesture, your object would look like this
```javascript
{
  size: { width: 200, height: 200 }, // size of your tile
  aspectRatio: 1920 / 1080, // aspect ratio based on the size of your image/video
  scale: 2 // at which scale the aspect ratio is no longer compromised
}
```
>[!IMPORTANT]
>SnapBackZoom resizes its own diemsnions not your component's ones, remember to use `{width: '100%', height: '100%'}` for images and videos so they cover the entire area of SnapBackZoom as it resizes.

At a scale of one your image is a tile of 200x200 pixel, in other words a square, but at a scale two it resizes to 200x340 pixel size becoming a rectangle matching with the image's aspect ratio.


## License
[MIT](./LICENSE) License.
