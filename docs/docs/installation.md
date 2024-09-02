---
title: Get Started
outline: deep
---

# Installation
Install `react-native-zoom-toolkit` in your project

::: code-group

```sh [npm]
npm install react-native-zoom-toolkit
```

```sh [yarn]
yarn add react-native-zoom-toolkit
```

:::

### Dependencies
This library relies on both Reanimated and Gesture Handler being part of your project, if you do not have them installed already please refer to [Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) and [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation) installation guides.

::: warning Beware iOS users
Dragging the components around as you pinch is disabled by default for iOS users unless you install a version of Gesture Handler greater than equals `2.16.0`.

For more information see this [Gesture Handler's issue](https://github.com/software-mansion/react-native-gesture-handler/issues/2833) and [this issue](https://github.com/Glazzes/react-native-zoom-toolkit/issues/10).
:::

::: code-group

```sh [npm]
npm install react-native-gesture-handler react-native-reanimated
```

```sh [yarn]
yarn add react-native-gesture-handler react-native-reanimated
```

```sh [expo]
npx expo install react-native-gesture-handler react-native-reanimated
```

:::

### Additional Setup
No additional setup is required.
