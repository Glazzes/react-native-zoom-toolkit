import { EventEmitter, type EventSubscription } from 'fbemitter';

// https://github.com/wcandillon/react-native-redash/blob/master/src/Physics.ts
export const snapPoint = (
  value: number,
  velocity: number,
  points: ReadonlyArray<number>
): number => {
  'worklet';
  const point = value + 0.2 * velocity;
  const deltas = points.map((p) => Math.abs(point - p));
  const minDelta = Math.min.apply(null, deltas);
  return points.filter((p) => Math.abs(point - p) === minDelta)[0]!;
};

const emitter = new EventEmitter();

const eventName = 'index-change';
export const subscribeToIndexChangeEvent = (
  callback: (index: number) => void
): EventSubscription => {
  return emitter.addListener(eventName, callback);
};

export const emitIndexChangeEvent = (index: number) => {
  emitter.emit(eventName, index);
};
