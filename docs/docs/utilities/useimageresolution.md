---
title: useImageResolution hook
description: A handy hook to get the resolution of a bundle or network image.
outline: deep
---

# useImageResolution hook
Get the resolution of a bundle or network image.

### How to use
```jsx
import { useImageResolution } from 'react-native-zoom-toolkit';

// Get resolution of a bundle image
const { isFetching, resolution, error } = useImageResolution(
  require('path to your bundle image asset')
);

// Get resolution of a network image
const { isFetching, resolution, error } = useImageResolution({
  uri: 'url to some network image',
  headers: {
    'Authorization': 'some bearer token',
  }
})

```
- parameter information

| Property | Type |Description |
|----------|------|------------|
| `source`    | `Source \| number` | An url pointing to a network image and headers or a require statement to a bundle image asset. |

- returns [FetchImageResolutionResult](#fetchimageresolutionresult)

## Type Definitions
### Source
| Property | Type |Description |
|----------|------|------------|
| `uri`    | `string` | An url pointing to a network image. |
| `headers`    | `Record<string, string> \| undefined` | Optional headers, in case you are accesing network protected images. |

### FetchImageResolutionResult

| Property | Type |Description |
|----------|------|------------|
| `isFetching`    | `boolean` | Whether the hook is fetching or not. |
| `resolution`    | `SizeVector \| undefined` | Width and height of the image. |
| `error` | `Error \| undefined` | An error in case the image fetching fails. |
