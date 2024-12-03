---
title: useImageResolution hook
description: A handy hook to get the resolution of a bundle or network image.
outline: deep
---

# useImageResolution hook

Get the resolution of a network, bundle or base64 image.

### How to use

```jsx
import { useImageResolution } from 'react-native-zoom-toolkit';

// Network image
const { isFetching, resolution, error } = useImageResolution({
  uri: 'url to some network image',
  headers: {
    Authorization: 'some bearer token',
  },
});

// Bundle image
const { isFetching, resolution, error } = useImageResolution(
  require('path to your bundle image asset')
);

// Base64 image
const { isFetching, resolution, error } = useImageResolution({
  uri: 'your base64 string',
});
```

## Type Definitions

### FetchImageResolutionResult

| Property     | Type                      | Description                                |
| ------------ | ------------------------- | ------------------------------------------ |
| `isFetching` | `boolean`                 | Whether the hook is fetching or not.       |
| `resolution` | `SizeVector \| undefined` | Width and height of the image.             |
| `error`      | `Error \| undefined`      | An error in case the image fetching fails. |
