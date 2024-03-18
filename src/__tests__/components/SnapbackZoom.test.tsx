import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import SnapbackZoom from '../../components/snapback/SnapbackZoom';
import { getInvalidChildrenMessage } from '../../commons/utils/messages';

describe('SnapbackZoom', () => {
  test('should render properly when one child is passed', () => {
    const snapback = (
      <SnapbackZoom>
        <View />
      </SnapbackZoom>
    );

    expect(render(snapback)).toBeDefined();
  });

  test('should throw an error when no child is passed', () => {
    const message = getInvalidChildrenMessage({
      name: 'SnapbackZoom',
      expected: 1,
      actual: 0,
    });

    expect(() => render(<SnapbackZoom />)).toThrow(message);
  });

  test('should throw error when more than on children are passed', () => {
    const snapback = (
      <SnapbackZoom>
        <View />
        <View />
      </SnapbackZoom>
    );

    const message = getInvalidChildrenMessage({
      name: 'SnapbackZoom',
      expected: 1,
      actual: 2,
    });

    expect(() => render(snapback)).toThrow(message);
  });
});
