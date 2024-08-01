import { EventEmitter, EventSubscription } from 'fbemitter';

type PlaybackEventCallback = (index: number) => void;
type SeekEventOptions = {
  positionMillis: number;
  index: number;
};

const emitter = new EventEmitter();

const PLAY_VIDEO_EVENT = 'play-video';
export const emitPlayVideoEvent = (index: number) => {
  emitter.emit(PLAY_VIDEO_EVENT, index);
};

export const listenToPlayVideoEvent = (
  cb: PlaybackEventCallback
): EventSubscription => {
  const subscription = emitter.addListener(PLAY_VIDEO_EVENT, cb);
  return subscription;
};

const PAUSE_VIDEO_EVENT = 'pause-video';
export const emitPauseVideoEvent = (index: number) => {
  emitter.emit(PAUSE_VIDEO_EVENT, index);
};

export const listenToPauseVideoEvent = (
  cb: PlaybackEventCallback
): EventSubscription => {
  const subscription = emitter.addListener(PAUSE_VIDEO_EVENT, cb);
  return subscription;
};

const STOP_VIDEO_EVENT = 'stop-video';
export const emitStopVideoEvent = () => {
  emitter.emit(STOP_VIDEO_EVENT);
};

export const listenToStopVideoEvent = (cb: () => void): EventSubscription => {
  const subscription = emitter.addListener(STOP_VIDEO_EVENT, cb);
  return subscription;
};

const SEEK_VIDEO_EVENT = 'seek-video';
export const emitSeekVideoEvent = (options: SeekEventOptions) => {
  emitter.emit(SEEK_VIDEO_EVENT, options);
};

export const listenToSeekVideoEvent = (
  cb: (options: SeekEventOptions) => void
): EventSubscription => {
  const subscription = emitter.addListener(SEEK_VIDEO_EVENT, cb);
  return subscription;
};
