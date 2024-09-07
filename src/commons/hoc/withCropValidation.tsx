import React, { forwardRef } from 'react';
import { type CropZoomProps } from '../../components/crop/types';

export default function withCropValidation<T, P extends CropZoomProps>(
  Component: React.ComponentType<P>
) {
  return forwardRef<T, P>((props, ref) => {
    const { minScale, maxScale } = props;

    if (minScale !== undefined && minScale < 1) {
      throw new Error('minScale property must be greater than or equals one');
    }

    if (maxScale !== undefined && maxScale < 1) {
      throw new Error('maxScale property must be greater than or equals one');
    }

    if (
      minScale !== undefined &&
      maxScale !== undefined &&
      minScale > maxScale
    ) {
      throw new Error('minScale property must not be greater than maxScale');
    }

    return <Component {...props} reference={ref} />;
  });
}
