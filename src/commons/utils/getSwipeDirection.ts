import type { PanGestureEvent, SwipeDirection, Vector } from '../types';

type SwipeOptions = {
  time: number;
  boundaries: Vector<number>;
  position: Vector<number>;
  translate: Vector<number>;
  timeThreshold?: number;
  velocityThreshold?: number;
  distanceThreshold?: number;
};

const DEFAULT_SWIPE_TIME_THRESHOLD = 175;
const DEFAULT_SWIPE_VELOCITY_THRESHOLD = 500;
const DEFAULT_SWIPE_DISTANCE_THRESHOLD = 20;

export const getSwipeDirection = (
  e: PanGestureEvent,
  options: SwipeOptions
): SwipeDirection | undefined => {
  'worklet';

  const { time, boundaries, position, translate } = options;
  const timeThreshold = Math.max(
    0,
    options.timeThreshold ?? DEFAULT_SWIPE_TIME_THRESHOLD
  );
  const velocityThreshold = Math.max(
    0,
    options.velocityThreshold ?? DEFAULT_SWIPE_VELOCITY_THRESHOLD
  );
  const distanceThreshold = Math.max(
    0,
    options.distanceThreshold ?? DEFAULT_SWIPE_DISTANCE_THRESHOLD
  );

  // @ts-ignore
  const deltaTime = performance.now() - time;
  const { x: boundX, y: boundY } = boundaries;

  const swipedDistanceX =
    Math.abs(position.x - e.absoluteX) >= distanceThreshold;
  const swipedDistanceY =
    Math.abs(position.y - e.absoluteY) >= distanceThreshold;
  const swipedInTime = deltaTime <= timeThreshold;

  const swipeRight =
    e.velocityX > 0 &&
    e.velocityX >= velocityThreshold &&
    swipedDistanceX &&
    swipedInTime;

  const inRightBound = translate.x === boundX;
  if (swipeRight && inRightBound) return 'right';

  const swipeLeft =
    e.velocityX < 0 &&
    e.velocityX <= -1 * velocityThreshold &&
    swipedDistanceX &&
    swipedInTime;

  const inLeftBound = translate.x === -1 * boundX;
  if (swipeLeft && inLeftBound) return 'left';

  const swipeUp =
    e.velocityY < 0 &&
    e.velocityY <= -1 * velocityThreshold &&
    swipedDistanceY &&
    swipedInTime;

  const inUpperBound = translate.y === -1 * boundY;
  if (swipeUp && inUpperBound) return 'up';

  const swipeDown =
    e.velocityY > 0 &&
    e.velocityY >= velocityThreshold &&
    swipedDistanceY &&
    swipedInTime;

  const inLowerBound = translate.y === boundY;
  if (swipeDown && inLowerBound) return 'down';

  return undefined;
};
