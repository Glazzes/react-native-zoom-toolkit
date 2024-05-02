---
title: Gallery
outline: deep
---

# Gallery
A practical gallery component which mimics the behaviour of Telegram's media messages gallery, among its more remarkable features you will find:

::: warning Experimental Feature
This component uses a highly tailored version of `ResumableZoom` component to meet the performance expectations of gallery component, therefore in its current state it only uses a small subset of the properties offered by `ResuambleZoom`, this may change in the future.
:::

- **Flatlist API:** A simple API which resembles React Native Flatlist's API
- **Pinch Gesture:** Accurate pinch gesture calculation, drag your component around as you pinch, scale your component in two different modes.
- **Double Tap:** Tap twice in a point of interest to trigger a zoom animation.
- **Tap to Item:** Tap on the edges of an item to go to the previous or next item.

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
| `number \| SizeVector<number>[]` | `6`  |

Maximum scale value allowed by the pinch gesture for all elements, expects values bigger than or equals one.

Alternatively you can pass an array with the resolution of your images/videos, for instance `[{ width: 1920, height: 1080 }]`; this will instruct the component to calculate `maxScale`  in such a way it's a value just before images and videos start getting pixelated for each element, the resolutions array must be as big as the `data` property array.

### onIndexChange
| Type | Default  | 
|------|----------|
| `(index: number) => void` | `undefined`  |

Callback triggered when the list scrolls to the next or previous item.

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
