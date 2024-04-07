<div>
  <h1 align="center">React Native Zoom Toolkit</h1>
</div>

<div>
  <h4 align="center">A set of utilities and components for common pinch to zoom feature requirements</h4>
</div>

The most feature rich React Native library to solve common use cases of the "pinch to zoom" interaction, as well as providing a barebones utility for complex use cases, for instance "pinch to zoom" React Native Skia's Components.

You can build a solution to some of the following problems with this library:

- Preview, zooming in the media contained in a chat message.
- Detail screens.
- Cropping an image or video.
- Build image galleries.

## Preview
>[!Note]
> Are you watching from NPM's website? NPM's markdown renderer wont render videos, watch them on [github](https://github.com/Glazzes/react-native-zoom-toolkit).

| SnapbackZoom | ResumableZoom | CropZoom |
|--------------|---------------|----------|
|<video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/19f73880-96ee-4eb4-b68f-53191faf4027" width="100%" controls> | <video src="https://github.com/Glazzes/react-native-zoom-toolkit/assets/52082794/f07a8916-e115-4af5-ae6d-932fa86a5e53" width="100%" controls> | <video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/7253f7d5-42b0-4426-92ca-5b6772e10b5e" width="100%" controls> |

## Features
- **Limitless**: Smoothly zoom in and out any component you want, you're not limited to images only.
- **Performance:** Smooth gesture interactions powered by Reanimated and Gesture Handler.
- **SnapBackZoom:** Zoom in and snap back, this component automatically snaps back to its original position once the gesture ends, making it ideal for previews.
- **ResumableZoom**: Pick up where you left last time! This component remembers your previous interactions with it, just the same way it works in your Android/IOS OS integrated gallery application, making it ideal for detail screens and gallery screens.
- **CropZoom:** An ideal, practical and unopinionated component for image and video cropping needs.
- **Mirror:** Mirror the current pinch gesture transformations to any other component you want.
- **Expo Compatible**: This library has been written in typescript only and supported modules by the expo SDK.

Features scheduled for the next minor release `1.2.0`.
- [ ] A simple and ready to use Image gallery component, which uses the `ResumableZoom` component, see [Example app's](./example/) Resumable gallery example for a preview.

## Documentation
To check out the docs, visit https://glazzes.github.io/react-native-zoom-toolkit/

## Demo
The example app comes with five different examples from which you can learn from, see the [Example app](./example/).

## License
[MIT](./LICENSE) License.
