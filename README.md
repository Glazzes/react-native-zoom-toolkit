
<div>
  <h1 align="center">React Native Zoomable</h1>
</div>

> [!WARNING]
> This library is in active development in order to bring a bettter development experience to the React Native community.

**<p style="text-align: center;">¡Snap back or resume the choice is yours!</p>**

## Features
- **Limitless**: Smoothly zoom in and out any component you want, you're not limited to images only.
- **Performance:** This libray is written with `Reanimated v3 (v2 compatible)` and `Geture Handler v2`
- **Resetable Zoom:** Zoom in and snap back, this component automatically snap backs to its original position once the gesture ends, making it ideal for zoomable previews.
- **Resumable Zoom**: Pick up where you left last time! This component remembers your previous interactions with it, just the same way it works in your Android/IOS OS integrated gallery application, making it ideal for detail screens.
- **Customizable Settings:**  Customizable zoom and gesture configuration settings.
- **Expo Go Compatible**: This library has been written with typescript only and supported modules by the expo go app, don't worry about recompiling your app. 


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

## Components: TODO

#### ResetableZoom
As its name suggests, it returns to its original position after the pinch gesture ends, this is very useful when dealing with previews of some sort, for instance like Telegram does it for chat messages containing images or Instagram for post previews. 

>[!NOTE]
>This component works by overlaying an animated view on top of your component, therefore it blocks all touches to your component, consider using `onTap` and `onDoubleTap` properties for touch handling.

For the most basic of usages, import the `ResetableZoom` component from `@glazzes/react-native-zoomable` and wrap a component of your choice with it, for instance:

```jsx
import { ResetableZoom } from "@glazzes/react-native-zoomable"

<ResetableZoom
  zIndex={100}
  hitSlop={{ vertical: 50, horizontal: 50 }}
  timingConfig={{ duration: 150, easing: Easing.linear }}
  onTap={(e) => console.log(e)}
  onDoubleTap={(e) => console.log(e)}
  onPinchStart={(e) => console.log(e)}
  onPinchEnd={(e) => console.log(e)}
  onGestureEnd={(finished) => console.log(finished)}>
    <Image
      source={{ uri: IMAGE }}
      style={{ width: 200, height: 200 }}
      resizeMethod={"scale"} {/* Very important for images in Android do not forget it */}
      resizeMode={"cover"}/>
</ResetableZoom>
```

#### Properties
| Property        | Type     | Default                        | Description                                                                                                                                                                                                                                                          |
| --------------- | -------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| zIndex          | number   | 0                              | zIndex style value to use as soon as the pinch gesture starts, see [notes](#resetablezoom-notes)                                                                                                                                                                                               |
| hitslop         | object   | undefined | increases the gesture detection area around your component in all directions by a given amount in pixels, useful when dealing with small components, see [hitslop](https://docs.swmansion.com/react-native-gesture-handler/docs/gesture-handlers/common-gh/#hitslop) |
| timingConfig    | object   | undefined                      | custom timing configirutation used to snap back to the original position, see [timing config](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/#config-)                                                                                |
| resizeConfig    | object   | undefined                      | dynamically recalculate the `ResetableZoom` component's `width` and `height` style properties to align with a given `aspect ratio` based on a `scale` value as the gesture scale increases, see [notes](#resetablezoom-notes).                                                            |
| onTap           | function | undefined                      | callback fired when a single tap is made                                                                                                                                                                                                                             |
| onDoubleTap     | function | undefined                      | callback fired when a double tap is made                                                                                                                                                                                                                             |
| onPinchStart    | function | undefined                      | callback fired when the pinch gesture starts                                                                                                                                                                                                                         |
| onPinchEnd      | function | undefined                      | callback fired as soon as the user lift their fingers off the screen                                                                                                                                                                                                 |
| onGestureEnd    | function | undefined                      | callback fired once the component has returned to its original position                                                                                                                                                                                              |
#### ResetableZoom Notes
**zIndex:** due to the historical lack of support for this property for Android, I adsive a quick read to [Expo's documentation](https://docs.expo.dev/ui-programming/z-index/) about this property if you aim to build complex interactions.

**resizeConfig:** everything is better with an example, imagine you have a lot of images you want to render as tiles of 200x200 pixel size, for many of those images the aspect ratio has been compromised, assume one of those images is 1980x1080 pixel size and you would like this image to resize in a way the aspect ratio is no longer compromised when the image as scaled two times by the pinch gesture, your object would look like this
```javascript
{
  size: {width: 200, height: 200}, // size of your tile
  aspectRatio: 1920 / 1080, // aspect ratio based on the size of your image/video
  scale: 2 // at which scale the aspect ratio is no longer compromised
}
```
>[!IMPORTANT]
>ResetableZoom resizes itself, however your component does not, remember to use `{flex: 1}` for images and videos so they cover the entire area ResetableZoom

At a scale of one your image is a tile of 200x200 pixel, in other words a square, but at a scale two it resizes to 200x340 pixel size becoming a rectangle matching with the image's aspect ratio.


## License
[MIT](./LICENSE) License.
