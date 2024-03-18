> [!WARNING]
> This library is a work in progress in order to deliver a better pinch to zoom experience to the React Native community.

<div>
  <h1 align="center">React Native Zoom Toolkit</h1>
</div>

<div>
  <h4 align="center">A toolkit for common pinch to zoom feature requirements</h4>
</div>

| SnapbackZoom | ResumableZoom | CropZoom |
|--------------|---------------|----------|
|<video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/74251348-9cad-470b-a22e-0db64ed73253" width="100%" controls>| <video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/dab98e12-0cf7-4f5c-a48b-084a0e10f184" width="100%" controls> | <video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/a19de577-f5fe-4ba4-8bbb-f9a5ebcc361d" width="100%" controls> |
 
## Motivation
Pinch to zoom is a must have feature for any application that displays images to the user, this one can be found in a wide variety of use cases:
- Zooming in media contained a chat message
- Detail screens
- Cropping an image or video
- Image galleries

The idea behind this library is to provide a set of components and utilities for the most common use cases of the "pinch to zoom" interaction.


## Features
- **Limitless**: Smoothly zoom in and out any component you want, you're not limited to images only.
- **Performance:** Smooth gesture interactions powered by Reanimated and Gesture Handler.
- **SnapBack Zoom:** Zoom in and snap back, this component automatically snaps back to its original position once the gesture ends, making it ideal for previews.
- **Resumable Zoom**: Pick up where you left last time! This component remembers your previous interactions with it, just the same way it works in your Android/IOS OS integrated gallery application, making it ideal for detail screens and gallery screens.
- **Crop Zoom:** An ideal, practical and unopinionated component for image and video cropping needs.
- **Expo Go Compatible**: This library has been written in typescript and supported modules by the expo go app.

## Documentation
To check out the docs, visit https://glazzes.github.io/react-native-zoomable/

## License
[MIT](./LICENSE) License.
