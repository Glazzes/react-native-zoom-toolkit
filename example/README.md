> [!NOTE]
> Are you looking to contribute? The examples have been recorded on an Android device as I do not have an IOS device, therefore some examples may look a bit off in IOS devices, I'm not talking about the library but the appbars seen in the examples below, the way both platforms handle the status bar height is "different", so if you have an iphone and want to ensure (and probably fix) they look the same in both platforms I'd be very grateful, thank you.

<div>
  <h1 align="center">React Native Zoom Toolkit's Example App</h1>
</div>

| SnapbackZoom Example | ResumableZoom Example | CropZoom Managed Example |
|--------------|---------------|----------|
|<video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/19f73880-96ee-4eb4-b68f-53191faf4027" width="100%" controls> | <video src="https://github.com/Glazzes/react-native-zoom-toolkit/assets/52082794/f07a8916-e115-4af5-ae6d-932fa86a5e53" width="100%" controls> | <video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/7253f7d5-42b0-4426-92ca-5b6772e10b5e" width="100%" controls> |

| ResumableZoom Gallery Example | CropZoom Skia Example | All Examples |
|-------------------------------|-----------------------|--------------|
|<video src="https://github.com/Glazzes/react-native-zoomable/assets/52082794/ac604b9e-39e1-417e-bd22-9e7489371165" width="100%" controls> | <video src="https://github.com/Glazzes/react-native-zoom-toolkit/assets/52082794/c45de549-2288-41a0-a52e-9a04fdaacb91" width="100%" controls> | <video src="https://github.com/Glazzes/react-native-zoom-toolkit/assets/52082794/ca4c9297-1717-41b6-ae15-3303e2147a90" width="100%" controls />

## About

This is an Expo managed application which contains five different examples that demonstrate some of the possible use cases for this library, among those examples you will find the following.

**SnapbackZoom Example:** A complex example using [SnapbackZoom](https://glazzes.github.io/react-native-zoom-toolkit/components/snapbackzoom.html) to enable zoomable in chat message previews, this example is used along with a Flatlist to demonstrate a more realistic approach.

**ResumableZoom Example:** A basic full screen image detail screen.

**ResumableZoom Gallery Example:** A complex example of [ResumableZoom](https://glazzes.github.io/react-native-zoom-toolkit/components/resumablezoom.html) used to power an image gallery using its `onSwipeRight`, `onSwipeLeft` and `onHorizontalBoundsExceeded` properties.

**CropZoom Managed Example:** A basic example of [CropZoom](https://glazzes.github.io/react-native-zoom-toolkit/components/cropzoom.html) used to power an image cropping / profile picture selection screen used along with [Expo image manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) library.

**CropZoom Skia Example:** A complex example of [CropZoom](https://glazzes.github.io/react-native-zoom-toolkit/components/cropzoom.html) used along with [React Native Skia](https://shopify.github.io/react-native-skia/) to crop images while applying some filters (Color matrices) to them.

## How to run
First you will need to clone the whole repository.

```sh
git clone https://github.com/Glazzes/react-native-zoom-toolkit.git
```

Install the dependencies and then start the app.

```sh
yarn install
yarn example start --clear
```

## License
[MIT](../LICENSE) License.
