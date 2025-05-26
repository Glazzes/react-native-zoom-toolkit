import React, { forwardRef } from 'react';
import type { ResumableZoomProps } from '../../components/resumable/types';

export default function withResumableValidation<
  T,
  P extends ResumableZoomProps
>(Component: React.ComponentType<P>) {
  return forwardRef<T, P>((props, ref) => {
    const childrenCount = React.Children.count(props.children);
    if (childrenCount !== 1) {
      const message = `ResumableZoom expected one child but received ${childrenCount} children`;
      throw new Error(message);
    }

    if (props.minScale !== undefined && props.minScale < 1) {
      throw new Error('minScale must be greater than or equals one');
    }

    if (typeof props.maxScale === 'number' && props.maxScale < 1) {
      throw new Error(
        'maxScale must be greater than one, or a SizeVector object in order to infer the max scale'
      );
    }

    if (
      props.minScale &&
      typeof props.maxScale === 'number' &&
      props.minScale > props.maxScale
    ) {
      throw new Error('minScale must not be greater maxScale');
    }

    if (
      props.longPressDuration !== undefined &&
      props.longPressDuration <= 250
    ) {
      throw new Error('longPressDuration must be greater than 250ms');
    }

    return <Component {...props} reference={ref} />;
  });
}
