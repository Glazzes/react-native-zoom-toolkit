
<div>
  <h1 align="center">React Native Zoom Toolkit</h1>
</div>

<div>
  <h4 align="center">A tool-kit for common pinch to zoom feature requirements</h4>
</div>

| SnapBackZoom |
|--------------|
|<video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/74251348-9cad-470b-a22e-0db64ed73253" width="100%" controls>|


> [!WARNING]
> This library is a work in progress in order to deliver a better pinch to zoom experience to the React Native community. 
 
## Motivation
Pinch to zoom is a must have feature for any application that displays images to the user, this one can be found in a wide variety of use cases:
- Zooming in media contained a chat message
- Detail screens
- Cropping an image or video
- Image galleries

The idea behind this library is to provide a set of components and utilities for the most common use cases of the Pinch to Zoom interaction.


## Features
- **Limitless**: Smoothly zoom in and out any component you want, you're not limited to images only.
- **Performance:** This library has been written with `Reanimated v3 (v2 compatible)` and `Gesture Handler v2`
- **SnapBack Zoom:** Zoom in and snap back, this component automatically snaps back to its original position once the gesture ends, making it ideal for zoomable previews.
- **Resumable Zoom**: Pick up where you left last time! This component remembers your previous interactions with it, just the same way it works in your Android/IOS OS integrated gallery application, making it ideal for detail screens.
- **Expo Go Compatible**: This library has been written in typescript and supported modules by the expo go app.

Planned features for next releases:
- [ ] **Crop Zoom:** An easy to use component for those applications that require cropping capabilities.
- [ ] **Image Gallery:** A simple and ready to use image gallery which uses ResumableZoom

## Documentation
To check out the docs, visit [React Native Zoom Toolkit's documentation]()

## License
[MIT](./LICENSE) License.
