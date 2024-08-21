import React from 'react';
import type { SnapBackZoomProps } from '../../components/snapback/types';

export default function withSnapbackValidation(
  Component: React.ComponentType<SnapBackZoomProps>
): React.FC<SnapBackZoomProps> {
  return (props) => {
    const childrenCount = React.Children.count(props.children);
    if (childrenCount !== 1) {
      const message = `SnapbackZoom expected one child but received ${childrenCount} children`;
      throw new Error(message);
    }

    return <Component {...props} />;
  };
}
