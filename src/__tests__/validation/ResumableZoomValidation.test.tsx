import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import ResumableZoom from '../../components/resumable/ResumableZoom';

describe('ResumableZoom Validation Tests', () => {
  it('should throw error if not child is passed', () => {
    expect(() => {
      return render(<ResumableZoom>{undefined}</ResumableZoom>);
    }).toThrow();
  });

  it('should throw error when minScale is bigger than maxScale', () => {
    expect(() => {
      return render(
        <ResumableZoom minScale={10} maxScale={5}>
          <View style={{ width: 200, height: 200 }} />
        </ResumableZoom>
      );
    }).toThrow();
  });

  it('should throw error when minScale is lesser than one', () => {
    expect(() => {
      return render(
        <ResumableZoom minScale={0.5}>
          <View style={{ width: 200, height: 200 }} />
        </ResumableZoom>
      );
    }).toThrow();
  });

  it('should throw error when maxScale is lesser than one', () => {
    expect(() => {
      return render(
        <ResumableZoom maxScale={0.5}>
          <View style={{ width: 200, height: 200 }} />
        </ResumableZoom>
      );
    }).toThrow();
  });

  it('should throw error when longPressDuration is lesser than equals 250', () => {
    expect(() => {
      return render(
        <ResumableZoom longPressDuration={200}>
          <View style={{ width: 200, height: 200 }} />
        </ResumableZoom>
      );
    }).toThrow();
  });
});
