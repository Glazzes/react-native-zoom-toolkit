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

export default function getSwipeDirection(
  e: PanGestureEvent,
  options: SwipeDirectionOptions
): SwipeDirection | undefined {
  'worklet';

  const { time, boundaries, position, translate } = options;

  const deltaTime = performance.now() - time;
  const deltaX = Math.abs(position.x - e.absoluteX);
  const deltaY = Math.abs(position.y - e.absoluteY);
  const { x: boundX, y: boundY } = boundaries;

  const swipeR =
    e.velocityX >= SWIPE_VELOCITY &&
    deltaX >= SWIPE_DISTANCE &&
    deltaTime <= SWIPE_TIME;

  const inRightBound = translate.x === boundX;
  if (swipeR && inRightBound) return SwipeDirection.RIGHT;

  const swipeL =
    e.velocityX <= -1 * SWIPE_VELOCITY &&
    deltaX >= SWIPE_DISTANCE &&
    deltaTime <= SWIPE_TIME;

  const inLeftBound = translate.x === -1 * boundX;
  if (swipeL && inLeftBound) return SwipeDirection.LEFT;

  const swipeU =
    e.velocityY <= -1 * SWIPE_VELOCITY &&
    deltaY >= SWIPE_DISTANCE &&
    deltaTime <= SWIPE_TIME;

  const inUpperBound = translate.y === -1 * boundY;
  if (swipeU && inUpperBound) return SwipeDirection.UP;

  const swipeD =
    e.velocityY >= SWIPE_VELOCITY &&
    deltaY >= SWIPE_DISTANCE &&
    deltaTime <= SWIPE_TIME;

  const inLowerBound = translate.y === boundY;
  if (swipeD && inLowerBound) return SwipeDirection.DOWN;

  return undefined;
}
