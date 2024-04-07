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
Due to the lack of decimal places for the focal point in iOS devices (see this [GH's issue](https://github.com/software-mansion/react-native-gesture-handler/issues/2833) and [this issue](https://github.com/Glazzes/react-native-zoom-toolkit/issues/10)), in order to provide the full feature set for iOS users, versions of React Native Gesture Handler greater than equals `2.16.0` are required.

Each component has a warning for those features affected if any.
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

### Addiotional Setup
No addiontal setup is required.