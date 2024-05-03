---
title: Resumable Zoom
description: An ideal component for detail screens.
outline: deep
---

# ResumableZoom
An ideal and practical component for detail screens, all gestures are resumable and will pick up where you left in your last interaction with the component.

Among its more remarkable features you will find:
- **Pan Gesture:** Drag and your components around in three different modes, optionally let your component slide with a decay animation.
- **Pinch Gesture:** Accurate pinch gesture calculation, drag your component around as you pinch, scale your component in two different modes.
- **Double Tap:** Tap twice in a point of interest to trigger a zoom animation.
- **Swipe Gesture:** Implements swipe to the right and swipe to the left gestures, ideal for galleries, see [gallery example](https://github.com/Glazzes/react-native-zoom-toolkit/tree/main/example).

The next video footage is taken from the [Example app](https://github.com/Glazzes/react-native-zoom-toolkit/tree/main/example).

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/resumablezoom.mp4" controls />
</div>

## How to use
Its usage is pretty straight forward, just wrap a component of your choice with it, the following example is a full screen image detail component.

::: tip Remember
- This component uses `flex: 1` therefore it will attempt to take all available space.
- This component is best utilized when at least one of the two dimensions of the wrapped component is bigger than equals the space it's occupying in the screen, for instance if it's a full screen image detail screen, your image should be as wide or as tall as the size of your screen.
:::

```jsx
import React from 'react';
import { Image, View, useWindowDimensions } from 'react-native';
import { ResumableZoom, getAspectRatioSize, useImageResolution } from 'react-native-zoom-toolkit';

const uri = 'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg'

const App = () => {
  const { width } = useWindowDimensions();

  // Gets the resolution of your image
  const { isFetching, resolution } = useImageResolution({ uri });
  if(isFetching || resolution === undefined) {
    return null;
  }

  // An utility function to get the size without compromising the aspect ratio
  const imageSize = getAspectRatioSize({
    aspectRatio: resolution.width / resolution.height,
    width: width
  })

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ResumableZoom maxScale={resolution}>
        <Image source={{uri}} style={imageSize} resizeMethod={'scale'} />
      </ResumableZoom>
    </View>
  )
}

export default App;
```

## Properties
All properties for this component are optional.

### hitslop
| Type | Default | Additional Info |
|------|---------|-----------------|
| `object` | `undefined` | see [HitSlop](https://docs.swmansion.com/react-native-gesture-handler/docs/gesture-handlers/common-gh/#hitslop) |

Increase (Android only) or decrease the gesture detection area around your component in all directions by a given amount in pixels, useful when dealing with small components.

### extendGestures
| Type | Default | 
|------|---------|
| `boolean` | `false` |

By default the gesture detection area is located around the wrapped component, by setting this property to `true`, the detection area is now increased to the whole space occupied by `ResuambleZoom`.

### minScale
| Type | Default | 
|------|---------|
| `number` | `1` |

Minimum scale value allowed by the pinch gesture, expects values greater than or equals one.

### maxScale
| Type | Default |
|------|---------|
| `SizeVector<number> \| number` | `6` |

Maximum scale value allowed by the pinch gesture, expects values bigger than or equals one.

Alternatively you can pass the resolution of your image/video, for instance `{ width: 1920, height: 1080 }`; this will instruct the component to calculate `maxScale`  in such a way it's a value just before images and videos start getting pixelated.

### panMode
| Type | Default | Additional Info |
|------|---------|-----------------|
| `PanMode` | `PanMode.CLAMP` | see [PanMode](#panmode-enum) |

Select which one of the three available pan modes to use.

### scaleMode
| Type | Default | Additional Info |
|------|---------|-----------------|
| `ScaleMode` | `ScaleMode.BOUNCE` | see [ScaleMode](#scalemode-enum) |

Select which one of the two available scale modes to use.

### decay
| Type | Default | Additional Info |
|------|---------|-----------------|
| `boolean` | `true` | see [WithDecay](https://docs.swmansion.com/react-native-reanimated/docs/animations/withDecay/) |

Whether to apply a decay animation when the pan gesture ends or not.

### panWithPinch
| Type | Default |
|------|---------|
| `boolean` | `true` | 

::: warning Beware iOS users
This feature is disabled by default for iOS users when a version of React Native Gesture Handler prior to `2.16.0` is installed, installing a version greater than equals `2.16.0` will set the value of this property to `true` by default.

For more information see this [Gesture Handler's issue](https://github.com/software-mansion/react-native-gesture-handler/issues/2833) and [this issue](https://github.com/Glazzes/react-native-zoom-toolkit/issues/10).
:::

Lets the user drag the component around as they pinch, it also provides a more accurate pinch gesture calculation to user interaction.

This feature is not a pan gesture, therefore it won't trigger any of the following callbacks while you pinch: `onPanStart`, `onPanEnd` and `onHorizontalBoundsExceeded`.

### panEnabled
| Type | Default |
|------|---------|
| `boolean` | `true` |

Enables and disables both pan and swipe gestures.

### pinchEnabled
| Type | Default |
|------|---------|
| `boolean` | `true` |

Enables and disables the pinch gesture.

### tapsEnabled
| Type | Default |
|------|---------|
| `boolean` | `true` |

Enables and disables both single and double tap gestures.

### onTap
| Type | Default | Additional Info |
|------|---------|-----------------|
| `function` | `undefined` | see [tap gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#event-data) |

Callback triggered when the user taps the wrapped component once, receives a tap gesture event as its only argument.

### onSwipeRight
| Type | Default |
|------|---------|
| `function` | `undefined` |

Callback triggered when the user swipes to the right.

::: tip Condition
This callback is only triggered when `panMode` property is set to `PanMode.CLAMP` (default value) and the right edge of your component is in contact with the right edge of its enclosing container.
:::

### onSwipeLeft
| Type | Default |
|------|---------|
| `function` | `undefined` |

Callback triggered when the user swipes to the left.

::: tip Condition
This callback is only triggered when `panMode` property is set to `PanMode.CLAMP` (default value) and the left edge of your component is in contact with the left edge of its enclosing container.
:::

### onPanStart
| Type | Default | Additional Info |
|------|---------|-----------------|
| `function` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

callback triggered when the pan gesture starts, receives a pan gesture event as its only argument.

### onPanEnd
| Type | Default | Additional Info |
|------|---------|-----------------|
| `function` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

Callback triggered as soon as the user lifts their finger off the screen, receives a pan gesture event as its only argument.

### onPinchStart
| Type | Default | Additional Info |
|------|---------|-----------------|
| `function` | `undefined` | see [pinch gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture#event-data) |

callback triggered when the pinch gesture starts, receives a pinch gesture event as its only argument.

### onPinchEnd
| Type | Default | Additional Info |
|------|---------|-----------------|
| `function` | `undefined` | see [pinch gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture#event-data) |

Callback triggered as soon as the user lifts their fingers off the screen after pinching, receives a pinch gesture event as its only argument.

### onGestureActive
| Type | Default | Additional Info |
|------|---------|----------------|
| `worklet function` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered when the internal state of the component changes, the internal state is updated as the user makes use of the gestures or execute its [methods](#methods), receives an object of type [ResumableZoomState](#resumablezoomstate) as its only argument.

Ideal if you need to mirror its current transformations values to some other component as it updates.

### onGestureEnd
| Type | Default | 
|------|---------|
| `function` | `undefined` |

Callback triggered when a pan gesture or a pinch gesture ends, if the gesture finished when the wrapped component was not in bounds, this one will wait for the snapback animation to end.

If the `decay` property is set to `true`, it will wait for the decay animation to end.

### onHorizontalBoundsExceeded
| Type | Default | Additional Info |
|------|---------|----------------|
| `worklet function` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered when the component has been panned beyond the boundaries defined by its enclosing container, receives as an argument how much the component has been panned beyond such boundaries, positive values from the right and negative values from the left.

Ideal to mimic scroll behavior.

::: tip Condition
Requires the `panMode` property to be set to `PanMode.CLAMP` (default value).
:::

## Methods
All methods are accessible through a ref object.

```jsx
import { useRef } from 'react';
import { ResumableZoom, type ResumableZoomType } from 'react-native-zoom-toolkit'

const ref = useRef<ResumableZoomType>(null);
ref.current?.reset(false);

<ResumableZoom ref={ref}>
  // some component here
</ResumableZoom>
```

### reset
Reset all transformations to their initial state.

- Arguments

| Name | Type | Default |Description |
|------|------|---------|------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |

- Returns `void`

### requestState
Request internal transformation values of this component at the moment of the calling.

- Takes no arguments
- Returns [ResumableZoomState](#resumablezoomstate)

### assignState
Assigns the internal transformation values for this component, if the state you have provided is considered to be not achievable by the component's boundaries, it'll be approximated to the closest valid state.
- Arguments

| Name | Type |Description |
|------|------|------------|
| state   | [ResumableZoomAssignableState](#resumablezoomassignablestate) | Object containg the transformation values to assign to `ResumableZoom` component. |
| animate | `boolean \| undefined` | Whether to animate the transition or not, defaults to `true`. |

- Returns `void`

## Type Definitions
### ResumableZoomState
| Property     |  Type    | Description                              |
|--------------|----------|------------------------------------------|
| `width`      | `number` | Width of the wrapped component.          |
| `height`     | `number` | Height of the wrapped component.         |
| `translateX` | `number` | Current translateX transformation value. |
| `translateY` | `number` | Current translateY transformation value. |
| `scale`      | `number` | Current scale transformation value.      |

### ResumableZoomAssignableState
| Property     |  Type    | Description                      |
|--------------|----------|----------------------------------|
| `translateX` | `number` | TranslateX transformation value. |
| `translateY` | `number` | TranslateY transformation value. |
| `scale`      | `number` | Scale transformation value.      |

### PanMode Enum
Determine how your component must behave when it reaches the specified boundaries by the container enclosing it.

| Property |Description |
|----------|------------|
| `CLAMP`  | Prevents the user from dragging the component out of the specified boundaries. |
| `FREE`   | Lets the user drag the component around freely, when the pan gesture ends the component will return to a position within the specified boundaries. |
| `FRICTION` | Lets the user drag the component around freely applying friction to the pan gesture up to a point where it's stopped completely, when the pan gesture ends the component will return to a position within the specified boundaries. |

### ScaleMode Enum
Determine how your component must behave when the pinch gesture's scale value exceeds the specified boundaries by `minScale` and `maxScale` properties.

| Property |Description |
|----------|------------|
| `CLAMP`  | Prevents the user from exceeding the scale boundaries. |
| `BOUNCE` | Lets the user scale above and below the scale boundary values, when the pinch gesture ends the scale value returns to `minScale` or `maxScale` respectively. |