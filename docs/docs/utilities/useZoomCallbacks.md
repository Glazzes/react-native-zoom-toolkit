---
title: useZoomCallbacks hook
outline: deep
---

# useZoomCallbacks hook

A simple utility for `ResumableZoom`, `CropZoom` and `Gallery` components to handle common zoom events such as

| Event Name        | Description                                                                        |
|-------------------|------------------------------------------------------------------------------------|
| onUpdate          | Callback triggered every time scale is updated                                     |
| onStart           | Callback triggered the very fist time scale value changes                          |
| onEnd             | Callback triggered once the scale value has returned to its base state             |
| onMaxScaleReached | Callback triggered once the scale value is greater than equals the max scale value |

## How to use

useZoomCallbacks is dependant on the zoom component's current state, therefore you need to use useTransformState hook in order to get such values.

```tsx {3}
const {state, onUpdate} = useTransformationState("common")
useZoomCallbacks(
  state,
  {
    onUpdate: (scale) => console.log("Current scale value ", scale),
    onStart: () => console.log("Zoom started"),
    onEnd: () => console.log("Zoom finished"),
    onMaxScaleReached: (scale) => console.log("Reached max scale at", scale)
  }
)

<ResumableZoom onUpdate={onUpdate}>
  <Image />
</ResumableZoom>
```