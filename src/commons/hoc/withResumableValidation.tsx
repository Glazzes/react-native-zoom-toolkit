import React, { forwardRef } from 'react';
import type { ResumableZoomProps } from '../../components/resumable/types';

export default function withResumableValidation<
  T,
  P extends ResumableZoomProps
>(Component: React.ComponentType<P>) {
  return forwardRef<T, P>((props, ref) => {
    const { minScale, maxScale, children } = props;

    const childrenCount = React.Children.count(children);
    if (childrenCount !== 1) {
      const message = `ResumableZoom expected one child but received ${childrenCount} children`;
      throw new Error(message);
    }

    if (minScale !== undefined && minScale < 1) {
      throw new Error('minScale must be greater than or equals one');
    }

    const isMaxScaleNumber = typeof maxScale === 'number';
    if (isMaxScaleNumber && maxScale < 1) {
      throw new Error(
        'maxScale must be greater than one, or a SizeVector object in order to infer the max scale'
      );
    }

    if (minScale && isMaxScaleNumber && minScale > maxScale) {
      throw new Error('minScale must not be greater maxScale');
    }

    return <Component {...props} reference={ref} />;
  });
}
