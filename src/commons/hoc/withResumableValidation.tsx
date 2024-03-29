import React from 'react';
import type { ResumableZoomProps } from '../../components/resumable/types';
import { forwardRef } from 'react';
import { getInvalidChildrenMessage } from '../utils/messages';

export default function withResumableValidation<
  T,
  P extends ResumableZoomProps
>(Component: React.ComponentType<P>) {
  return forwardRef<T, P>((props, ref) => {
    const { minScale, maxScale, children } = props;

    const expectedChildren = 1;
    const childrenCount = React.Children.count(children);

    if (childrenCount !== expectedChildren) {
      const message = getInvalidChildrenMessage({
        name: 'ResumableZoom',
        expected: expectedChildren,
        actual: childrenCount,
      });

      throw new Error(message);
    }

    if (minScale !== undefined && minScale < 1) {
      throw new Error('minScale must be greater than or equals one');
    }

    const isMaxScaleNumber = typeof maxScale === 'number';
    if (maxScale !== undefined && isMaxScaleNumber && maxScale < 1) {
      throw new Error(
        'maxScale must be greater than one, or a size vector object in order to infer the max scale'
      );
    }

    if (
      minScale !== undefined &&
      maxScale !== undefined &&
      isMaxScaleNumber &&
      minScale > maxScale
    ) {
      throw new Error('minScale must not be greater than or equals maxScale');
    }

    return <Component {...props} reference={ref} />;
  });
}
