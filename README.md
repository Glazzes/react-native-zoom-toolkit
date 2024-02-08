
<div>
  <h1 align="center">React Native Zoomable</h1>
</div>

> [!WARNING]
> This library is in active development in order to bring a bettter development experience to the React Native community.

**<p style="text-align: center;">¡Snap back or resume the choice is yours!</p>**

## Features
- **Limitless**: Smoothly zoom in and out any component you want, you're not limited to images only.
- **Performance:** This libray is written with `Reanimated v3 (v2 compatible)` and `Geture Handler v2`
- **ResetableZoom:** Zoom in and snap back, this component automatically snap backs to its original position once the gesture ends, making it ideal for zoomable previews.
- **ResumableZoom**: Pick up where you left last time! This component remembers your previous interaction with it, the same way it works in your Android/IOS OS integrated gallery application, ideal for detail screens.
- **Customizable Settings:**  Customizable zoom and gesture configuration settings.
- **Expo Go Compatible**: This library has been written with typescript only and supported modules by the expo go app, don't worry about recompiling your app. 


## Getting Started

Install `react-native-zoomable` in your project by using one of the two following commands:

```sh
npm install react-native-zoomable
yarn add react-native-zoomable
```

> [!IMPORTANT]
> This library requires both `react-native-reanimated` and `react-native-gesture-handler` to be part of your project.

If you're working with an expo managed app install the latest supported versions with the following command:

```sh
npx expo install react-native-reanimated react-native-gesture-handler
```

For bare (CLI) workflow users follow the installation guides for both [Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) and [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)

## Components: TODO

#### ResetableZoom
For the most basic of usages, import the `ResetableZoom` component from `react-native-zoomable` and wrap a component of your choice with it, for instance:

```jsx
import {ResetableZoom} from "react-native-zoom"

<ResetableZoom>
  <Image source={{uri}} style={styles.image} resizeMethod={"scale"} />
</RestableZoom>
```

## License
The library is licensed under the [MIT](./LICENSE) License.