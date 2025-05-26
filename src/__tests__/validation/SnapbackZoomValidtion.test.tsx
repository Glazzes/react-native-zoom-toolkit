import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import SnapbackZoom from '../../components/snapback/SnapbackZoom';

describe('SnapbackZoom Validation Tests', () => {
  test('should render properly when one child is passed', () => {
    const snapback = (
      <SnapbackZoom>
        <View />
      </SnapbackZoom>
    );

    expect(render(snapback)).toBeDefined();
  });

  test('should throw an error when no child is passed', () => {
    const message = `SnapbackZoom expected one child but received 0 children`;
    // @ts-ignore
    expect(() => render(<SnapbackZoom />)).toThrow(message);
  });

  test('should throw error when more than on children are passed', () => {
    const snapback = (
      <SnapbackZoom>
        <View />
        <View />
      </SnapbackZoom>
    );

    const message = `SnapbackZoom expected one child but received 2 children`;
    expect(() => render(snapback)).toThrow(message);
  });

  test('should throw error when longPressDuration is lesser than equals 250', () => {
    expect(() => {
      return render(
        <SnapbackZoom longPressDuration={200}>
          <View style={{ width: 200, height: 200 }} />
        </SnapbackZoom>
      );
    }).toThrow();
  });
});
