import React, { forwardRef } from 'react';
import { CropMode, type CropZoomProps } from '../../components/crop/types';
import type { SizeVector } from '../types';
import getAspectRatioSize from '../../utils/getAspectRatioSize';
import { getInvalidChildrenMessage } from '../utils/messages';
import { getInvalidCropSizeMessage } from '../../components/crop/utils/messages';

export default function withCropValidation<T, P extends CropZoomProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return forwardRef<T, P>((props, ref) => {
    const { mode, resolution, minScale, maxScale, children } = props;

    const childrenCount = React.Children.count(children);
    if (childrenCount !== 1 && mode === CropMode.MANAGED) {
      const message = getInvalidChildrenMessage({
        name: 'CropZoom',
        expected: 1,
        actual: childrenCount,
      });

      throw new Error(message);
    }

    if (childrenCount !== 0 && mode === CropMode.OVERLAY) {
      const message = getInvalidChildrenMessage({
        name: 'CropZoom',
        expected: 0,
        actual: childrenCount,
      });

      throw new Error(message);
    }

    if (minScale !== undefined && minScale < 1) {
      throw new Error('minScale must be greater than or equals one');
    }

    if (maxScale !== undefined && maxScale >= 0 && maxScale < 1) {
      throw new Error(
        'maxScale must be greater than one, or a negative number in order to infer the max scale'
      );
    }

    if (
      minScale !== undefined &&
      maxScale !== undefined &&
      minScale > maxScale
    ) {
      throw new Error('minScale must not be greater than or equals maxScale');
    }

    /*
     * Infers the opposite dimension while clamping the ones provided for the user in order to prevent
     * errors that could lead to an unusuable component for not so common use cases
     */
    const isPortrait = resolution.height >= resolution.width;
    let cropSize: SizeVector<number> = props.cropSize;
    const { width, height } = getAspectRatioSize({
      aspectRatio: resolution.width / resolution.height,
      width: isPortrait ? cropSize.width : undefined,
      height: isPortrait ? undefined : cropSize.height,
    });

    if (isPortrait && cropSize.height > height) {
      const message = getInvalidCropSizeMessage({
        dimension: 'height',
        actual: cropSize.height,
        expected: height,
      });

      console.warn(message);
      cropSize.height = height;
    }

    if (!isPortrait && cropSize.width > width) {
      const message = getInvalidCropSizeMessage({
        dimension: 'width',
        actual: cropSize.width,
        expected: width,
      });

      console.warn(message);
      cropSize.width = width;
    }

    return <WrappedComponent {...props} cropSize={cropSize} reference={ref} />;
  });
}
