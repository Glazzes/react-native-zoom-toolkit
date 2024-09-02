---
title: How to use with Skia components
outline: deep
---

# How to use with Skia Components

As the saying goes "no pain, no gain", setting up any of this library components with Skia requires a little
more effort than wrapping a component into another, at this point you may have think of one of these two
solutions already:

- I'm gonna use x zoom component within my Skia canvas.
- I'm gonna wrap my Skia canvas within x zoom component.

Sadly none of them works, the first one will crash your app and the second one may look like it's working but
it will produce a pixelated result because your canvas is getting scaled directly by one of the zoom components.

## Working around this issue

In order to get this working as expected we want to mirror the transformation state from the zoom component
to the Skia component, this way the Skia canvas never gets scaled but the items within it do.

Luckily for you, the components exposed by this library have a property called `onUpdate` which reports
the changes in the transformation state.

To make it short, we can to use these zoom components by nesting a transparent view and update the Skia components
accordingly to the values provided by `onUpdate` callback.

## The Heart of the Matter

In order to achieve our goal we'd have to write some boilerplate code, including shared values, derived
transformation values and an update function to put all those values together, this library takes all of
that burden away from you in the form of [useTransformationState](../utilities/usetransformationstate) hook.

## Skia and ResumableZoom

ResumableZoom is the heart of this library, therefore it makes the most sense to showcase the Skia usage with it,
however the techniques you will use are also applicable to the other components as well. As an example we'll focus
on replicating the example seen in ResumableZoom documentation, let's set up our basic structure with Skia first.

```tsx{38-39}
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Canvas, Image, useImage } from '@shopify/react-native-skia';
import { getAspectRatioSize } from 'react-native-zoom-toolkit';

const uri =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const App = () => {
  const image = useImage(uri);
  const { width, height } = useWindowDimensions();

  if (image === null) {
    return null;
  }

  const resolution = { width: image.width(), height: image.height() };
  // This is the size the image will take on the screen, not its resolution.
  const imageSize = getAspectRatioSize({
    aspectRatio: resolution.width / resolution.height,
    width: width,
  });

  const x = 0;
  const y = (height - imageSize.height) / 2;
  const centerX = width / 2;
  const centerY = y + imageSize.height / 2;

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        <Image
          image={image}
          x={x}
          y={y}
          width={imageSize.width}
          height={imageSize.height}
          // Center of transformation must match the center of the image
          origin={vec(centerX, centerY)}
        />
      </Canvas>
    </View>
  );
};

export default App;
```

With our basic structure in place, let's address the two missing steps to make this example work:

- Overlay ResumableZoom on top of the Skia Canvas in such a way our transparent view and our Skia image are parallel
  to each other.
- Use `useTransformationState` hook and assign `onUpdate` callback to ResumableZoom's onUpdate
  property and `transform` property to Skia Image's transform property.

Let's see how the end result looks like:

```tsx{12,39,43-51}
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Canvas, Image, useImage } from '@shopify/react-native-skia';
import { getAspectRatioSize, useTransformationState } from 'react-native-zoom-toolkit';

const uri =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const App = () => {
  const image = useImage(uri);
  const { width, height } = useWindowDimensions();
  const { onUpdate, transform } = useTransformationState();

  if (image === null) {
    return null;
  }

  const resolution = { width: image.width(), height: image.height() };
  const imageSize = getAspectRatioSize({
    aspectRatio: resolution.width / resolution.height,
    width: width,
  });

  const x = 0;
  const y = (height - imageSize.height) / 2;
  const centerX = width / 2;
  const centerY = y + imageSize.height / 2;

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        <Image
          image={image}
          x={x}
          y={y}
          width={imageSize.width}
          height={imageSize.height}
          origin={vec(centerX, centerY)}
          transform={transform}
        />
      </Canvas>

      <View style={{ width, height, position: 'absolute' }}>
        <ResumableZoom
          maxScale={resolution}
          extendGestures={true}
          onUpdate={onUpdate}
      >
          <View style={{ width: imageSize.width, height: imageSize.height }} />
        </ResumableZoom>
      </View>
    </View>
  );
};

export default App;
```

Let's see what we can take from this example

- The overlying zoom component must be the same size as the canvas, this also applies to the transparent view
  size and the Skia component to zoom.
- You can assign a color to the transparent view and lower the opacity if you are having trouble centering the
  zoom component with your Skia component.
- Skia Images get pixelated at a faster rate than RN image component does, therefore setting ResumableZoom's
  maxscale to the image resolution is a recommended practice.

And that's pretty much it, thanks for reading!
