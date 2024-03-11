import React from 'react';
import type { SnapBackZoomProps } from '../../components/snapback/types';

export default function withSnapbackValidation(
  WrappedComponent: React.ComponentType<SnapBackZoomProps>
): React.FC<SnapBackZoomProps> {
  return (props) => {
    const childrenCount = React.Children.count(props.children);
    if (childrenCount !== 1) {
      throw new Error(
        `SnapbackZoom expected a single child, but received ${childrenCount}`
      );
    }

    return <WrappedComponent {...props} />;
  };
}
