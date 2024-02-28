---
outline: deep
---

# Crop Zoom

## How to use
Sadly in order to provide the most unopinionated API possible, it requires a good chunk of boilerplate to be used, so here's a starting template you can use

## Properties
### cropSize
- Type: `{width: number, height: number}`
- Required


### resolution
- Type: `{width: number, height: number}`
- Required

Resolution of your image/video or how big whatever you are tying to crop is

### OverlayComponent
- Type: `JSX.Element`
- Required

### onGestureActive
- Type: [worklet function](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/)
- Default: `undefinied`


## Methods
All methods are accesible through a ref object
```jsx
import { useRef } from 'react';
import { CropZoom, type CropZoomType } from '@glazzes/react-native-zoomable'

const ref = useRef<CropZoomType>(null);
ref.current?.canvasToSize(200);

<CropZoom ref={ref} />
```

### rotate
Rotates the component 90 degrees clockwise in a range from 0 to 360 degrees
- Arguments

| name | type | default |description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not |

### flipHorizontal
Flips the component horizontally
- Arguments

| name | type | default |description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not |

### flipVertical
Flips the component vertically
- Arguments

| name | type | default |description |
|------|------|-----|--------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not |

### canvasToSize
Maps all the trasnformations applied to your component into a simple and ready to use object specifying the context necessary for a crop action, such object takes into account the following transformations `translateX`, `translateY`, `scale`, `rotate`, `rotateX` and `rotateY`.
- Arguments

| name | type | default | description |
|------|------|-------------|---------|
| fixedCropWidth | `number \| undefined` | `undefined` |Enforce all resulting crops to be of a fixed width, height is infered by the computed CropZoom's [cropSize](#cropsize) property aspect ratio |

- Returns
[CropContextResult](#cropcontextresult)

:::danger Caution
The order in which you apply the values given by [CropContextResult](#cropcontextresult) matters, they should be applied in the following order

- rotate
- resize (if aplicable)
- flip verticaly and horizontaly
- crop
:::

### reset
Resets all transformations to their initial state
- Arguments

| name | type | default |description |
|------|------|---------|------------|
| animate | `boolean \| undefined` | `true` | Whether to animate the transition or not |

## Type Definitions
### CropContextResult
```typescript
type CropContextResult = {
    crop: {
        x: number;
        y: number;
        width: number;
        height: number;
    },
    context: {
        rotationAngle: number;
        flipHorizontal: boolean;
        flipVertical: boolean;
    },
    resize?: {
        width: number;
        height: number;
    }
}
```

- `crop` Fields specify top-left corner and size of a crop rectangle.
- `context` Fields specify wheter to flip the image or not, as well as to what angle the image/video must be rotated
- `resize` Fields specify the size your image/video must be resized to before cropping, if its `undefined` it means resizing is not necessary
