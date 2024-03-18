import React from 'react';
import type { SnapBackZoomProps } from '../../components/snapback/types';
import { getInvalidChildrenMessage } from '../utils/messages';

export default function withSnapbackValidation(
  WrappedComponent: React.ComponentType<SnapBackZoomProps>
): React.FC<SnapBackZoomProps> {
  return (props) => {
    const expectChildren = 1;
    const childrenCount = React.Children.count(props.children);

    if (childrenCount !== expectChildren) {
      const message = getInvalidChildrenMessage({
        name: 'SnapbackZoom',
        expected: expectChildren,
        actual: childrenCount,
      });

      throw new Error(message);
    }

    return <WrappedComponent {...props} />;
  };
}
