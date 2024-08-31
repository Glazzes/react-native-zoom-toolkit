---
title: useTransformationState hook
outline: deep
---

# useTransformationState hook

Provide all the boilerplate code necessary to mirror the state from a zoom component to any other component of
your choice, for a hands on example see [How to use with Skia Components](../guides/skia) guide.

## How to use

When calling this hook it will provide the three following properties:

- `onUpdate` is a worklet function which must be passed as a property to the zoom component's onUpdate
  callback property, this way the zoom component will update transform and state properties.
- `transform` is a shared value containing the transformation array of the zoom component.
- `state` is an object holding the shared values describing the current transformation state in case
  you need them.

```tsx{9,21}
import { useTransformationState } from 'react-native-zoom-toolkit';

// Pass 'crop' as argument if you want to mirror CropZoom's state
// Pass 'snapback' as argument if you want to mirror SnapbackZoom's state
// Pass 'resumable' as argument for any other component state
const { onUpdate, transform, state } = useTransformationState('resumable');

//...
<ResumableZoom onUpdate={onUpdate}>
  <Image source={{uri}} style={styles.image} />
</ResumableZoom>

//...
<Canvas>
  <Image
    source={image}
    x={0}
    y={0}
    width={200}
    height={200}
    transform={transform}
  />
</Canvas>
```
