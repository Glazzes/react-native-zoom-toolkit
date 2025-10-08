import { useAnimatedReaction, useSharedValue, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { CommonZoomState } from "../commons/types";

type CallbackOptions<T> = {
  state: T;
  onStart?: () => void;
  onUpdate?: (scale: number) => void;
  onEnd?: () => void;
  onMaxScaleReached?: (scale: number) => void;
}

export default function useZoomCallbacks<T extends CommonZoomState<SharedValue<number>>>(options: CallbackOptions<T>) {
  const hasZoomed = useSharedValue<boolean>(false);
  const hasReachedMaxScale = useSharedValue<boolean>(false)

  useAnimatedReaction(
    () => options.state.scale.value,
    (value, previousValue) => {
      if(options.onUpdate) {
        scheduleOnRN(options.onUpdate, value)
      }

      if (value !== 1 && !hasZoomed.value) {
        hasZoomed.value = true;

        if (options.onStart === undefined) return;
        scheduleOnRN(options.onStart);
      }

      if (value === 1 && previousValue !== 1 && hasZoomed.value) {
        hasZoomed.value = false;

        if (options.onEnd === undefined) return;
        scheduleOnRN(options.onEnd)
      }

      if(value < options.state.maxScale.value && hasReachedMaxScale.value) {
        hasReachedMaxScale.value = false;
      }

      if(
        value >= options.state.maxScale.value 
        && options.onMaxScaleReached
        && !hasReachedMaxScale.value
      ) {
        hasReachedMaxScale.value = true;
        scheduleOnRN(options.onMaxScaleReached, options.state.maxScale.value)
      }

    },
    [options.state]
  );

}