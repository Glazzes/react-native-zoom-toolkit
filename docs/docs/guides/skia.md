---
title: How to use with Skia components
outline: deep
---

# How to use with Skia Components

As the saying goes "no pain, no gains", setting up any of this library components with Skia requires a little
more effort than wrapping a component into a another, you may have think of one of these two solutions
already:

- I'm gonna use x component within a `Canvas` element.
- I'm gonna wrap my `Canvas` within X component.

Sadly none of them works, the first one will crash your app and the second one may look like it's working but
it will produce a pixelated result because your canvas is getting scaled directly by one of the zoom components.

## Working around this issue

In order to get this working as expected we want to mirror the transformation state from one component to the
other, so the Skia Canvas never gets scaled directly but the items within it do.

Luckily for you, the components exposed by this library have a property called `onGestureActive` which reports
the changes in the transformation state.

To make it short, we can to use these components with transparent views and update the Skia components accordingly
to the values provided by `onGestureActive` callback.

## The Heart of the Matter

ResumableZoom is the heart of this library, therefore it makes the most sense to showcase the Skia usage with it,
however the techniques you will use are also applicable to the other components as well.

As of today release (2.1.4) we need to write some boilerplate in the form of a simplified hook, in the
next major release a complete version of this hook will come bundled with the library.

```ts
import {
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type { Transforms3d } from '@shopify/react-native-skia';
import type { ResumableZoomState } from 'react-native-zoom-toolkit';

type ResumableTransformationValues = {
  transform: Readonly<SharedValue<Transforms3d>>;
  onUpdate: (state: ResumableZoomState) => void;
};

export const useResumableValues = (): ResumableTransformationValues => {
  const translateX = useSharedValue<number>(0);
  const translateY = useSharedValue<number>(0);
  const scale = useSharedValue<number>(1);

  const transform = useDerivedValue<Transforms3d>(() => {
    return [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ];
  }, [scale, translateY, translateX]);

  const onUpdate = (updateState: CommonZoomState) => {
    'worklet';
    translateX.value = updateState.translateX;
    translateY.value = updateState.translateY;
    scale.value = updateState.scale;
  };

  return { onUpdate, transform };
};
```

## Skia and ResumableZoom

We will focus on replicating the example seen in ResumableZoom documentation, let's set up our basic structure
with Skia first.

```tsx{38}
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
          origin={vec(centerX, centerY)} // Center of transformation must match the center of the image
        />
      </Canvas>
    </View>
  );
};

export default App;
```

With our basic structure in place, let's discuss the two missing steps to make this example work:

- Overlay ResumableZoom on top of the Skia Canvas in such a way it's parallel with our Skia Image.
- Use the hook we just created a moment ago, assign `onUpdate` callback to ResumableZoom's onGestureActive
  property and `transform` property to Skia Image's transform property.

Let's see how the end result looks like:

```tsx{13,39,44-48}
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Canvas, Image, useImage } from '@shopify/react-native-skia';
import { getAspectRatioSize } from 'react-native-zoom-toolkit';
import { useResumableValues } from 'path to the hook we created above';

const uri =
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg';

const App = () => {
  const image = useImage(uri);
  const { width, height } = useWindowDimensions();
  const { onUpdate, transform } = useResumableValues();

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
        <ResumableZoom maxScale={resolution} extendGestures={true} onGestureActive={onUpdate}>
          <View style={{ width: imageSize.width, height: imageSize.height }} />
        </ResumableZoom>
      </View>
    </View>
  );
};

export default App;
```

Let's see what we can take from this example

- The overlying zoom component must be the same size as the canvas.
- You can assign a color to the transparent view and lower the opacity if you are having trouble centering the
  zoom component with your Skia component.
- Skia Images pixelate at a faster rate than RN image component, therefore setting maxscale to the image
  resolution is a recommended practice.

And that's pretty much it, thanks for reading!
