const mapSecondsToMinutes = (seconds: number) => {
  'worklet';
  const minutes = Math.floor(seconds / 60);
  const remaningSeconds = seconds % 60;

  let minuteStr = '';
  let secondStr = '';
  if (minutes < 10) {
    minuteStr = `0${minutes}`;
  } else {
    minuteStr = minutes.toString();
  }

  if (remaningSeconds < 10) {
    secondStr = `0${remaningSeconds}`;
  } else {
    secondStr = remaningSeconds.toString();
  }

  return `${minuteStr}:${secondStr}`;
};

export const convertTimeToText = (
  durationInSeconds: number,
  progess: number
): string => {
  'worklet';

  const duration = Math.floor(durationInSeconds);
  const currentProgress = Math.floor(durationInSeconds * progess);

  const durationStr = mapSecondsToMinutes(duration);
  const progressStr = mapSecondsToMinutes(currentProgress);

  return `${progressStr} / ${durationStr}`;
};
