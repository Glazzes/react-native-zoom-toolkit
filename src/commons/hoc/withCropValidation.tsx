import React, { forwardRef } from 'react';
import { CropMode, type CropZoomProps } from '../../components/crop/types';

export default function withCropValidation<T, P extends CropZoomProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return forwardRef<T, P>((props, ref) => {
    const { mode, minScale, maxScale, children } = props;
    const childrenCount = React.Children.count(children);

    if (childrenCount !== 1 && mode === CropMode.MANAGED) {
      throw new Error(
        `CropZoom expected a single child in managed mode, but received ${childrenCount}`
      );
    }

    if (childrenCount !== 0 && mode === CropMode.OVERLAY) {
      throw new Error(
        `CropZoom expected no child on overlay mode, but received ${childrenCount}`
      );
    }

    if (minScale !== undefined && minScale < 1) {
      throw new Error('minScale must be greater than or equals one');
    }

    if (maxScale !== undefined && maxScale > 0 && maxScale < 1) {
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

    return <WrappedComponent {...props} reference={ref} />;
  });
}
