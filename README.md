
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


## Getting Started
> [!IMPORTANT]
> This library relies on both Reanimated and Gesture Handler being part of you project, if you do not have them installed already please refer to [Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) and [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation) installation guides.

Install `@glazzes/react-native-zoomable` in your project

```sh
npm install @glazzes/react-native-zoomable
```

## Components: TODO

#### ResetableZoom
For the most basic of usages, import the `ResetableZoom` component from `react-native-zoomable` and wrap a component of your choice with it, for instance:

```jsx
import {ResetableZoom} from "@glazzes/react-native-zoomable"

{/* normal use case */}
<ResetableZoom>
  <Image source={{uri}} style={styles.image} resizeMethod={"scale"} />
</RestableZoom>

{/* dinamically resizes to  match with aspect ratio */}
<ResetableZoom resizeConfig={{
  size: {width: 200, 200},
  aspectRatio: 1.5,
  scale: 1.75
}}>
  <Image source={{uri}} style={{ flex: 1 }} resizeMethod={"scale"} />
</RestableZoom>
```

>[!NOTE]
>This component works by overlaying an animated view on top of your component, therefore it blocks any touch to your component, consider using `onTap` and `onDoubleTap` properties.

#### Properties
| Property        | Type     | Default                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------- | -------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| zIndex          | number   | 0                              | zIndex value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| hitslop         | object   | `{vertical: 0, horizontal: 0}` | increases the gesture detection area in pixels, useful when dealing with small components, see [hitslop]([https://docs.swmansion.com/react-native-gesture-handler/docs/gesture-handlers/common-gh/#hitslop](https://docs.swmansion.com/react-native-gesture-handler/docs/gesture-handlers/common-gh/#hitslop))                                                                                                                                                                                                                  |
| timingConfig    | object   | undefined                      | custom timing configirutation used to snap back to the original position, see [timing config]([https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/#config-](https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming/#config-))                                                                                                                                                                                                                                       |
| resizeConfig    | object   | undefined                      | dynamically recalculate the `ResetableZoom` component's `width` and `height` style properties to align with a given `aspect ratio` based on a `scale` value as the gesture scale increases, see [note]().
| gesturesEnabled | boolean  | true                           | enables or disables all gestures, when disabled  `onTap`, `onDobuleTap`, `onPinchStarts`, `onPinchEnd` and `onGestureEnd` will not work, and your component is capable of detecting touches once again                                                                                                                                                                                                                                                                                                                                                                                            |
| onTap           | function | undefined                      | callback fired when a single tap is made                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| onDoubleTap     | function | undefined                      | callback fired when a double tap is made                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| onPinchStart    | function | undefined                      | callback fired when the pinch gesture starts                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| onPinchEnd      | function | undefined                      | callback fired as soon as the user lift their fingers off the screen                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| onGestureEnd    | function | undefined                      | callback fired once the component has returned to its original position                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## License
[MIT](./LICENSE) License.