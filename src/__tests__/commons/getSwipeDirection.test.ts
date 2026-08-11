import { afterEach, describe, expect, it, jest } from '@jest/globals';

import type { PanGestureEvent } from '../../commons/types';
import { getSwipeDirection } from '../../commons/utils/getSwipeDirection';

declare const performance: { now: () => number };

const createEvent = (absoluteX: number, velocityX: number): PanGestureEvent =>
  ({
    absoluteX,
    absoluteY: 0,
    velocityX,
    velocityY: 0,
  }) as PanGestureEvent;

const options = {
  time: 0,
  boundaries: { x: 0, y: 0 },
  position: { x: 0, y: 0 },
  translate: { x: 0, y: 0 },
};

describe('getSwipeDirection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('preserves the default swipe thresholds', () => {
    const now = jest.spyOn(performance, 'now').mockReturnValue(175);

    expect(getSwipeDirection(createEvent(-20, -500), options)).toBe('left');
    expect(getSwipeDirection(createEvent(-20, -499), options)).toBeUndefined();
    expect(getSwipeDirection(createEvent(-19, -500), options)).toBeUndefined();

    now.mockReturnValue(176);
    expect(getSwipeDirection(createEvent(-20, -500), options)).toBeUndefined();
  });

  it('supports custom swipe thresholds', () => {
    jest.spyOn(performance, 'now').mockReturnValue(200);

    expect(
      getSwipeDirection(createEvent(-10, -200), {
        ...options,
        timeThreshold: 200,
        velocityThreshold: 200,
        distanceThreshold: 10,
      })
    ).toBe('left');
  });
});
