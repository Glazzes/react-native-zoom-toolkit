import { SwipeDirection, type PanGestureEvent, type Vector } from '../types';

type SwipeDirectionOptions = {
  time: number;
  boundaries: Vector<number>;
  position: Vector<number>;
  translate: Vector<number>;
};

const SWIPE_TIME = 175;
const SWIPE_VELOCITY = 500;
const SWIPE_DISTANCE = 20;

export const getSwipeDirection = (
  e: PanGestureEvent,
  options: SwipeDirectionOptions
): SwipeDirection | undefined => {
  'worklet';

  const { time, boundaries, position, translate } = options;

  const deltaTime = performance.now() - time;
  const deltaX = Math.abs(position.x - e.absoluteX);
  const deltaY = Math.abs(position.y - e.absoluteY);
  const { x: boundX, y: boundY } = boundaries;

  const swipeRight =
    e.velocityX >= SWIPE_VELOCITY &&
    deltaX >= SWIPE_DISTANCE &&
    deltaTime <= SWIPE_TIME;

  const inRightBound = translate.x === boundX;
  if (swipeRight && inRightBound) return SwipeDirection.RIGHT;

  const swipeLeft =
    e.velocityX <= -1 * SWIPE_VELOCITY &&
    deltaX >= SWIPE_DISTANCE &&
    deltaTime <= SWIPE_TIME;

  const inLeftBound = translate.x === -1 * boundX;
  if (swipeLeft && inLeftBound) return SwipeDirection.LEFT;

  const swipeUp =
    e.velocityY <= -1 * SWIPE_VELOCITY &&
    deltaY >= SWIPE_DISTANCE &&
    deltaTime <= SWIPE_TIME;

  const inUpperBound = translate.y === -1 * boundY;
  if (swipeUp && inUpperBound) return SwipeDirection.UP;

  const swipeDown =
    e.velocityY >= SWIPE_VELOCITY &&
    deltaY >= SWIPE_DISTANCE &&
    deltaTime <= SWIPE_TIME;

  const inLowerBound = translate.y === boundY;
  if (swipeDown && inLowerBound) return SwipeDirection.DOWN;

  return undefined;
};
