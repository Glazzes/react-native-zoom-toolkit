---
title: Gallery
description: An unopinionated component for building zoomable galleries
outline: deep
---

# Gallery

A practical gallery component which mimics Telegram's gallery behavior, among its more remarkable features you will find:

- **Flatlist API:** A simple API which resembles React Native Flatlist's API
- **Pinch Gesture:** Accurate pinch gesture calculation, drag your component around as you pinch, scale your component in two different modes.
- **Double Tap:** Tap twice in a point of interest to trigger a zoom animation.
- **Tap to Item:** Tap on the edges of an item to go to the previous or next item.
- **Custom Scroll Transition**: Customize scroll behavior with your own transitions.

The next video footage is taken from the [Example app](https://github.com/Glazzes/react-native-zoom-toolkit/tree/main/example)
while using a custom transition.

<div style="width: 100%; display: flex; justify-content: center; align-items: center">
  <video src="../assets/gallery.mp4" controls />
</div>

## How to use

The following example is a full screen image gallery.

::: tip Remember

- Follow React Native's [performance recommendations](https://reactnative.dev/docs/optimizing-flatlist-configuration#list-items) for list components.

- Each cell is as big as the size of the `Gallery` component itself.
  :::

::: code-group

```tsx [Gallery.tsx]
import React, { useCallback, useRef } from 'react';
import {
  stackTransition,
  Gallery,
  type GalleryType,
} from 'react-native-zoom-toolkit';

import GalleryImage from './GalleryImage';

const images = [
  'https://kutyaknak.hu/shop_ordered/73803/pic/gsp.jpg',
  'https://cdn.britannica.com/02/132502-050-F4667944/macaw.jpg',
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg',
  'https://i0.wp.com/bcc-newspack.s3.amazonaws.com/uploads/2023/05/052323-Foxes-in-Millennium-Park-Colin-Boyle-9124.jpg?fit=1650%2C1099&ssl=1',
];

const GalleryExample = () => {
  const ref = useRef<GalleryType>(null);

  // Remember to memoize your callbacks properly to keep a decent performance
  const renderItem = useCallback((item: string, index: number) => {
    return <GalleryImage uri={item} index={index} />;
  }, []);

  const keyExtractor = useCallback((item: string, index: number) => {
    return `${item}-${index}`;
  }, []);

  const onTap = useCallback((_, index: number) => {
    console.log(`Tapped on index ${index}`);
  }, []);

  const transition = useCallback(stackTransition, []);

  return (
    <Gallery
      ref={ref}
      data={images}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onTap={onTap}
      customTransition={transition}
    />
  );
};

export default GalleryExample;
```

```js [GalleryImage.tsx]
import React, { useState } from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { fitContainer } from 'react-native-zoom-toolkit';

type GalleryImageProps = {
  uri: string;
  index: number;
};

const GalleryImage: React.FC<GalleryImageProps> = ({ uri, index }) => {
  const { width, height } = useWindowDimensions();
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  }>({
    width: 1,
    height: 1,
  });

  const size = fitContainer(resolution.width / resolution.height, { width, height });

  return (
    <Image
      source={{ uri }}
      style={size}
      resizeMethod={'scale'}
      resizeMode={'cover'}
      onLoad={(e) => {
        setResolution({
          width: e.nativeEvent.source.width,
          height: e.nativeEvent.source.height,
        });
      }}
    />
  );
};

export default GalleryImage;

```

:::

## Properties

### data

| Type  | Required |
| ----- | -------- |
| `T[]` | `Yes`    |

An array of items to render.

### renderItem

| Type                                      | Required |
| ----------------------------------------- | -------- |
| `(item: T, index: number) => JSX.Element` | `Yes`    |

Takes an item from data and renders it into the list, provides additional metadata like index if you need it.

### keyExtractor

| Type                                  | Default     |
| ------------------------------------- | ----------- |
| `(item: T, index: number) => string;` | `undefined` |

Used to extract a unique key for a given item at the specified index.

### windowSize

| Type     | Default |
| -------- | ------- |
| `number` | `5`     |

Maximum number of items to be rendered at once.

### gap

| Type     | Default |
| -------- | ------- |
| `number` | `0`     |

Blank space between items.

### initialIndex

| Type     | Default |
| -------- | ------- |
| `number` | `0`     |

Sets the initial position of the list.

### vertical

| Type      | Default |
| --------- | ------- |
| `boolean` | `false` |

Modifies the orientation of the component to vertical mode.

### maxScale

| Type                             | Default |
| -------------------------------- | ------- |
| `SizeVector<number>[] \| number` | `6`     |

Maximum scale value allowed by the pinch gesture for all elements, expects values bigger than or equals one.

You can also pass an array as big as the `data` property array containing the resolution of your images/videos,
for instance `[{width: 1920, height: 1080}, {width: 1000, height: 1000}]`; maxScale will be infered for each
element in such a way it's a value just before your content starts to pixelate.

### zoomEnabled

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

Enables or disables both pinch and double tap gestures.

### tapOnEdgeToItem

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

Allow the user to go to the next or previous item by tapping the horizontal edges of the gallery, this property
only works in horizontal mode.

### allowOverflow

| Type      | Default |
| --------- | ------- |
| `boolean` | `false` |

::: tip Tip
This property's usage is intended for creating a carousel with zoomable previews, if that's your goal do
the following:

- Set this property to true.
- Set `pinchCenetingMode` property to sync.
- Set `scaleMode` property to bounce.
- Set `maxScale` property to 1.
  :::

Allow the items of gallery to overflow the container during a pinch gesture.

### scaleMode

| Type                  | Default    |
| --------------------- | ---------- |
| `'clamp' \| 'bounce'` | `'bounce'` |

Determine how your component must behave when the pinch gesture's scale value exceeds boundaries
defined by the minimum scale (1) and `maxScale` property, possible values are:

- `clamp` keeps the scale whithin the already mentioned scale boundaries.
- `bounce` lets the user scale above and below the scale boundary values, at the end of the pinch gesture
  the scale value animates back to 1 or `maxScale` respectively.

### allowPinchPanning

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

Lets the user drag the current item around as they pinch, it also provides a more accurate pinch gesture calculation to user interaction.

### pinchCenteringMode

| Type                | Default   |
| ------------------- | --------- |
| `'clamp' \| 'sync'` | `'clamp'` |

::: tip Tip
This property does nothing unless `allowPinchPanning` property is set to `true`.
:::

Determine the behavior used by the pinch gesture relative to the boundaries of its enclosing component,
possible values are:

- `clamp` keeps the pinch gesture clamped to the borders or its enclosing container during the entirity of the
  gesture, just like seen on Android galleries.
- `sync` keeps the pinch gesture in sync with user interaction, if the pinch gesture was released in an out bonds
  position it will animate back to a position within the bondaries of its enclosing container.

### onIndexChange

| Type                      | Default     |
| ------------------------- | ----------- |
| `(index: number) => void` | `undefined` |

Callback triggered when the list scrolls to the next or previous item.

### onTap

| Type                                          | Default     | Additional Info                                                                                                            |
| --------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: TapGestureEvent, index: number) => void` | `undefined` | see [tap gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#event-data) |

Callback triggered when the user taps the current item once, provides additional metadata like index if you need it.

### onVerticalPull

| Type                                              | Default     | Additional Info                                                                                    |
| ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(translateY: number, released: boolean) => void` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

::: tip Trigger Conditions

- Gallery must be on horizontal mode
- The current item must be at a scale of one.
  :::

Worklet callback triggered as the user drags the component vertically when this one is at a scale of one, it includes metadata like `released` parameter which indicates whether the user stopped pulling.

This property is useful for instance to animate the background color based on the translateY parameter.

### onSwipe

| Type                                                       | Default     |
| ---------------------------------------------------------- | ----------- |
| `(direction: 'up' \| 'down' \| 'left' \| 'right') => void` | `undefined` |

Callback triggered when the user swipes up, down, left or right.

### onScroll

| Type                                              | Default     | Additional Info                                                                                    |
| ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(scroll: number, contentOffset: number) => void` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered as the user scrolls the gallery.

### onPanStart

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: PanGestureEvent) => void` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

Callback triggered when the pan gesture starts.

### onPanEnd

| Type                           | Default     | Additional Info                                                                                                            |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(e: PanGestureEvent) => void` | `undefined` | see [pan gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#event-data) |

Callback triggered as soon as the user lifts their finger off the screen.

### onPinchStart

| Type                             | Default     | Additional Info                                                                                                                |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `(e: PinchGestureEvent) => void` | `undefined` | see [pinch gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture#event-data) |

Callback triggered when the pinch gesture starts.

### onPinchEnd

| Type                             | Default     | Additional Info                                                                                                                |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `(e: PinchGestureEvent) => void` | `undefined` | see [pinch gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture#event-data) |

Callback triggered as soon as the user lifts their fingers off the screen after pinching.

### longPressDuration

| Type      | Default |
| --------- | ------- |
| `number`  | `500`   |

Minimum time expressed in milliseconds required to trigger the long press gesture event, expect values greater than 250 to avoid collisions with tap and double tap gestures.

### onLongPress

| Type                                      | Default     | Additional Info                                                                                    |
| ----------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(e: LongPressEvent, index: number) => void` | `undefined` | see [long press gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/long-press-gesture/#event-data) |

Callback triggered as soon as the long press gesture starts.

### onUpdate

| Type                                      | Default     | Additional Info                                                                                    |
| ----------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(state: CommonZoomState<number>) = void` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered when the transformation state of the component changes, the internal state is updated as
the user makes use of the gestures or execute its methods, ideal if you need to mirror its current transformation
values to some other component as it updates, see [CommonZoomState](#commonzoomstate).

### onGestureEnd

| Type         | Default     |
| ------------ | ----------- |
| `() => void` | `undefined` |

Callback triggered when a pan, pinch or double tap gesture ends, if an animation started at the end of one
of the gestures the execution of this callback will be delayed until such animation finishes.

### onZoomBegin

| Type                      | Default     |
| ------------------------- | ----------- |
| `(index: number) => void` | `undefined` |

Callback triggered when component is zoomed from its base state (scale value at one).

### onZoomEnd

| Type                      | Default     |
| ------------------------- | ----------- |
| `(index: number) => void` | `undefined` |

Callback triggered when component returns back to its original state (scale value at one).

### customTransition

| Type                                           | Default     | Additional Info                                                                                    |
| ---------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `(state: GalleryTransitionState) => ViewStyle` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback used to modify the scroll animation used by the gallery, keep in mind the following when
building a custom transition:

- All elements are absolute positioned one on top of another.
- Use `translateX` and `translateY` style properties to position the items to your particular needs.

The base scroll behaviour looks like this:

```js
const baseAnimation = (state) => {
  'worklet';
  const { index, vertical, scroll, gallerySize } = state;

  if (vertical) {
    const translateY = index * gallerySize.height - scroll;
    return { transform: [{ translateY }] };
  }

  const translateX = index * gallerySize.width - scroll;
  return { transform: [{ translateX }] };
};
```

## Methods

All methods are accessible through a ref object.

```tsx
import { useRef } from 'react';
import { Gallery, type GalleryType } from 'react-native-zoom-toolkit';

const ref = useRef<GalleryType>(null);
ref.current?.requestState();

<Gallery ref={ref} />;
```

### reset

Reset all transformations to their initial state.

- type definition: `(animate?: boolean) => void`
- parameter information

| Name      | Type                   | Description                                                   |
| --------- | ---------------------- | ------------------------------------------------------------- |
| `animate` | `boolean \| undefined` | Whether to animate the transition or not, defaults to `true`. |

### requestState

Request internal transformation values of the current item at the moment of the calling

- type definition: `() => CommonZoomState<number>`;
- return type: [CommonZoomState](#commonzoomstate).

### setIndex

Jump to the item at the given index.

- type definition: `(index: number) => void`
- parameter information

| Name  | Type     | Description                         |
| ----- | -------- | ----------------------------------- |
| index | `number` | Index of the item to transition to. |

## Type Definitions

### CommonZoomState

| Property     | Type     | Description                              |
| ------------ | -------- | ---------------------------------------- |
| `width`      | `number` | Width of the current item.               |
| `height`     | `number` | Height of the current item.              |
| `translateX` | `number` | Current translateX transformation value. |
| `translateY` | `number` | Current translateY transformation value. |
| `scale`      | `number` | Current scale transformation value.      |

### GalleryTransitionState

| Property      | Type                     | Description                                           |
| ------------- | ------------------------ | ----------------------------------------------------- |
| `index`       | `number`                 | Index of an item rendered in the gallery.             |
| `activeIndex` | `number`                 | Index of the currently displayed item on the gallery. |
| `gap`         | `number`                 | Blank space between items.                            |
| `direction`   | `vertical \| horizontal` | Direction of the gallery.                             |
| `isScrolling` | `boolean`                | Whether the gallery is actively being scrolled.       |
| `scroll`      | `number`                 | Current scroll value.                                 |
| `gallerySize` | `SizeVector<number>`     | Width and height of the gallery.                      |
