---
title: Gallery
description: An unopinionated component for building galleries
outline: deep
---

# Gallery
A practical gallery component which mimics Telegram's gallery behavior, among its more remarkable features you will find:

::: warning Experimental Feature
This component uses a highly customized version of `ResumableZoom` component to meet the performance expectations of gallery component, therefore in its current state it only uses a small subset of the properties offered by `ResuambleZoom`, this may change in the future.
:::

- **Flatlist API:** A simple API which resembles React Native Flatlist's API
- **Pinch Gesture:** Accurate pinch gesture calculation, drag your component around as you pinch, scale your component in two different modes.
- **Double Tap:** Tap twice in a point of interest to trigger a zoom animation.
- **Tap to Item:** Tap on the edges of an item to go to the previous or next item.

The next video footage is taken from the [Example app](https://github.com/Glazzes/react-native-zoom-toolkit/tree/main/example).

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
import { Gallery, type GalleryType } from 'react-native-zoom-toolkit';

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

  return (
    <Gallery
      ref={ref}
      data={images}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onTap={onTap}
    />
  );
};

export default GalleryExample;
```

```js [GalleryImage.tsx]
import React, { useState } from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { getAspectRatioSize } from 'react-native-zoom-toolkit';

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

  const size = getAspectRatioSize({
    aspectRatio: resolution.width / resolution.height,
    width: height > width ? width : undefined,
    height: height > width ? undefined : height,
  });

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
| Type | Required | 
|------|----------|
| `T[]`| `Yes`    |

An array of items to render.

### renderItem
| Type | Required | 
|------|----------|
| `(item: T, index: number) => JSX.Element` | `Yes`    |

Takes an item from data and renders it into the list, provides additional metadata like index if you need it.

### keyExtractor
| Type | Default |
|------|----------|
| `(item: T, index: number) => string;` | `undefined`    |

Used to extract a unique key for a given item at the specified index.

### windowSize
| Type | Default  | 
|------|----------|
| `number` | `5`  |

Maximum number of items to be rendered at once.

### initialIndex
| Type | Default  | 
|------|----------|
| `number` | `0`  |

Sets the initial position of the list.

### maxScale
| Type | Default  | 
|------|----------|
| `SizeVector<number>[] \| number` | `6`  |

Maximum scale value allowed by the pinch gesture for all elements, expects values bigger than or equals one.

Alternatively you can pass an array with the resolution of your images/videos, for instance `[{ width: 1920, height: 1080 }]`; this will instruct the component to calculate `maxScale`  in such a way it's a value just before images and videos start getting pixelated for each element, the resolutions array must be as big as the `data` property array.

### tapOnEdgeToItem
| Type | Default  | 
|------|----------|
| `boolean` | `true`  |

Allow the user to go to the next or previous item by tapping the horizontal edges of the gallery.

### allowPinchPanning
| Type | Default |
|------|---------|
| `boolean` | `true` | 

::: warning Beware iOS users
This feature is disabled by default for iOS users when a version of React Native Gesture Handler prior to `2.16.0` is installed, installing a version greater than equals `2.16.0` will set the value of this property to `true` by default.

For more information see this [Gesture Handler's issue](https://github.com/software-mansion/react-native-gesture-handler/issues/2833) and [this issue](https://github.com/Glazzes/react-native-zoom-toolkit/issues/10).
:::

Lets the user drag the current item around as they pinch, it also provides a more accurate pinch gesture calculation to user interaction.

### onIndexChange
| Type | Default  | 
|------|----------|
| `(index: number) => void` | `undefined`  |

Callback triggered when the list scrolls to the next or previous item.

### onTap
| Type | Default  | Additional Info |
|------|----------|-----------------|
| `(e: TapGestureEvent, index: number) => void` | `undefined` | see [tap gesture event data](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#event-data) |

Callback triggered when the user taps the current item once, provides additional metadata like index if you need it.

### onScroll
| Type | Default | Additional Info |
|------|---------|----------------|
| `(scroll: number, contentOffset: number) => void` | `undefined` | see [worklets](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) |

Worklet callback triggered as the user scrolls the gallery.

## Methods
All methods are accessible through a ref object.

```jsx
import { useRef } from 'react';
import { Gallery, type GalleryType } from 'react-native-zoom-toolkit'

const ref = useRef<GalleryType>(null);
ref.current?.requestState();

<Gallery ref={ref} />
```

### reset
Reset all transformations to their initial state.

- Arguments

| Name | Type | Default |Description |
|------|------|---------|------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not. |

- Returns `void`

### requestState
Request internal transformation values of the current item at the moment of the calling.

- Takes no arguments
- Returns [ResumableZoomState](#resumablezoomstate)

### setIndex
Jump to the item at the given index.

- Arguments

| Name  | Type  | Description |
|-------|-------|-------------|
| index | `number` | Index of the item to transition to. |

- Returns `void`

## Type Definitions
### ResumableZoomState
| Property     |  Type    | Description                              |
|--------------|----------|------------------------------------------|
| `width`      | `number` | Width of the current item.               |
| `height`     | `number` | Height of the current item.              |
| `translateX` | `number` | Current translateX transformation value. |
| `translateY` | `number` | Current translateY transformation value. |
| `scale`      | `number` | Current scale transformation value.      |
