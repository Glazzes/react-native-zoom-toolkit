---
title: fitContainer
description: Get width and height of an element to fit a container
outline: deep
---

# fitContainer

Get the width and height for an element based on its aspect ratio and the container it's meant to fit.

## Type Definition

| Name        | Type                 | Description                         |
| ----------- | -------------------- | ----------------------------------- |
| aspectRatio | `number`             | Aspect ratio of the element to fit. |
| container   | `SizeVector<number>` | Width and height of the container.  |

## How to use

```js
const container = useWindowDimensions();
const resolution = { width: 1920, height: 1080 };
const size = fitContainer(resolution.width / resolution.height, {
  width: container.width,
  height: container.height,
});
```
