---
title: Downscaling Nested Components
outline: deep
---

# Downscaling Nested Components

Sometimes you may find yourself in the need of preserving the scale of a nested component independent of the
current zoom scale, something like a map marker for instance, so let's take a look of how it's done.

## How to

All elements within a zoom component will be scaled equally, so what you need is to perform the inverse process
in such a way the zoom scale from the parent component is cancelled out by our downscale process, let's set up
our custom downscale component.

```tsx{9,15}
import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

type DownscaleProps = React.PropsWithChildren<{
  scale: SharedValue<number>;
  style?: ViewStyle;
}>;

const Downscale = ({ scale, style, children }: DownscaleProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 / scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>;
  );
};

export default Downscale;
```

Pay attention to the highlighted lines, it requires a shared value describing the current state of the zoom scale
and why is it `1 / scale`? Let's address the last one first, this is a pretty common pattern in math, for instance
the inverse square root of a number is `1 / sqrt(n)`, you don't need to know much about math just know this
is the inverse scaling process.

Returning to the scale shared value, you can opt to write the neccesary code yourself or use `useTransformationState`
hook, what you need is the scale shared value and a way to update it.

::: code-group

```ts [Manual]
const scale = useSharedValue<number>(1);
const onUpdate = (state) => {
  'worklet';
  scale.value = state.scale;
};
```

```ts [Hook]
const { onUpdate, state } = useTransformationState('resumable');
state.scale; // Holds the shared value describing the current scale
onUpdate; // Update worklet function
```

:::

With our shared value and update function in place, all is left is to set onUpdate function to a zoom component's
onUpdate callback property and scale value to the Downscale component's scale property.

::: code-group

```tsx [Manual]{8,10}
const scale = useSharedValue<number>(1);
const onUpdate = (state) => {
  'worklet';
  scale.value = state.scale;
};
// ...

<ResumableZoom onUpdate={onUpdate}>
  <Map>
    <Downscale scale={scale}>
      <Marker />
    </Downscale>
  </Map>
</ResumableZoom>;
```

```tsx [Hook]{4,6}
const { onUpdate, state } = useTransformationState('resumable');
//...

<ResumableZoom onUpdate={onUpdate}>
  <Map>
    <Downscale scale={state.scale}>
      <Marker />
    </Downscale>
  </Map>
</ResumableZoom>;
```

:::

This is pretty much it, you can expand this basic setup to your particular requirements.

## Why isn't this a built-in feature?

YOU as a user of this library may be wondering why I the author of this library do not ship this component as
part of the library, here are the reasons:

- This is way too niche, therefore it does not serve a general purpose usage.
- Context! I can't tell what kind of components you need to downscale, you may be working with RN's components,
  Skia components or SVG components, each one of these contexts require custom code to achieve the same result,
  so I better show the solution and you work around it.

This stuff may probably never make it to the library as built-in feature, however you're free to make a question
in the Github issues if you're having trouble adapting it to a different context.
