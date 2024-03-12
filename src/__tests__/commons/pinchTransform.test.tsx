import type { SizeVector, Vector } from '../../commons/types';
import { pinchTransform } from '../../commons/utils/pinchTransform';

describe('Pinch transform', () => {
  // For these tests imagine we've got an image of 300x300 pixel size and our focal poiint
  // is located at x: 100 and y: 150
  const size: SizeVector<number> = { width: 300, height: 300 };
  const focal: Vector<number> = { x: 100, y: 150 };
  const origin: Vector<number> = {
    x: focal.x - size.width / 2,
    y: focal.y - size.height / 2,
  };

  test('should provide an accurate pinch transformation from the beginning', () => {
    const result = pinchTransform({
      fromScale: 1,
      toScale: 8,
      origin: origin,
      offset: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    });

    expect(result).toStrictEqual({ x: 350, y: 0 });
  });

  // Pinch from 1 to 4 then from 4 to 8
  test('should provide an accurate pinch transformation when resuming the gesture', () => {
    const initialScale = 1;
    const midScale = 4;
    const finalScale = 8;

    const initialTransformation = pinchTransform({
      fromScale: initialScale,
      toScale: midScale,
      origin: origin,
      offset: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    });

    const finalTransformation = pinchTransform({
      fromScale: midScale,
      toScale: finalScale,
      origin: origin,
      offset: initialTransformation,
      delta: { x: 0, y: 0 },
    });

    expect(finalTransformation).toStrictEqual({ x: 350, y: 0 });
  });
});
