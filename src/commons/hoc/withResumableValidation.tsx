import React, { forwardRef } from 'react';
import type { CommonResumableProps } from '../types';

export default function withResumableValidation<
  T,
  P extends CommonResumableProps
>(WrappedComponent: React.ComponentType<P>) {
  return forwardRef<T, P>((props, ref) => {
    const { minScale, maxScale } = props;

    if (minScale !== undefined && minScale < 1) {
      throw new Error('minScale must be greater than equals one');
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
      throw new Error('minScale must not be greater than maxScale');
    }

    return <WrappedComponent {...props} reference={ref} />;
  });
}
