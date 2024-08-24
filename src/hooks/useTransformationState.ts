import {
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useVector } from '../commons/hooks/useVector';
import { useSizeVector } from '../commons/hooks/useSizeVector';
import type { CommonZoomState } from '../commons/types';
import type { SnapbackZoomState } from '../components/snapback/types';
import type { CropZoomState } from '../components/crop/types';

type ComponentSelection = 'resumable' | 'snapback' | 'crop';

type StateSelection<T extends ComponentSelection, S> = T extends 'snapback'
  ? SnapbackZoomState<S>
  : T extends 'crop'
  ? CropZoomState<S>
  : CommonZoomState<S>;

type TransformNames =
  | 'translateX'
  | 'translateY'
  | 'scale'
  | 'rotate'
  | 'rotateX'
  | 'rotateY';

type Transformations = { [Name in TransformNames]: number };
type Transforms3d =
  | Pick<Transformations, 'translateX'>
  | Pick<Transformations, 'translateY'>
  | Pick<Transformations, 'scale'>
  | Pick<Transformations, 'rotate'>
  | Pick<Transformations, 'rotateX'>
  | Pick<Transformations, 'rotateY'>;

type TransformationState<T extends ComponentSelection> = {
  onUpdate: (state: StateSelection<T, number>) => void;
  state: StateSelection<T, SharedValue<number>>;
  transform: Readonly<SharedValue<Transforms3d[]>>;
};

export const useTransformationState = <T extends ComponentSelection>(
  param: T
): TransformationState<T> => {
  const size = useSizeVector(0, 0);
  const translate = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const xy = useVector(0, 0);
  const resize = useSizeVector(0, 0);

  const rotate = useVector(0, 0);
  const rotation = useSharedValue<number>(0);

  const transform = useDerivedValue<Transforms3d[]>(() => {
    return [
      { translateX: translate.x.value },
      { translateY: translate.y.value },
      { scale: scale.value },
      { rotate: rotation.value },
      { rotateX: rotate.x.value },
      { rotateY: rotate.y.value },
    ];
  }, [translate, rotate, scale, rotation]);

  const createSharedState = (): StateSelection<T, SharedValue<number>> => {
    // @ts-ignore
    const state: SharedStateSelection<T> = {
      width: size.width,
      height: size.height,
      translateX: translate.x,
      translateY: translate.y,
      scale: scale,
    };

    if (param === 'crop') {
      (state as CropZoomState<SharedValue<number>>).rotateX = rotate.x;
      (state as CropZoomState<SharedValue<number>>).rotateY = rotate.y;
      (state as CropZoomState<SharedValue<number>>).rotate = rotation;
    }

    if (param === 'snapback') {
      (state as SnapbackZoomState<SharedValue<number>>).x = xy.x;
      (state as SnapbackZoomState<SharedValue<number>>).y = xy.y;
      (state as SnapbackZoomState<SharedValue<number>>).resizedWidth =
        resize.width;

      (state as SnapbackZoomState<SharedValue<number>>).resizedHeight =
        resize.height;
    }

    return state;
  };

  const onUpdate = (state: StateSelection<T, number>): void => {
    'worklet';
    size.width.value = state.width;
    size.height.value = state.height;
    translate.x.value = state.translateX;
    translate.y.value = state.translateY;
    scale.value = state.scale;

    if (param === 'crop') {
      rotate.x.value = (state as CropZoomState<number>).rotateX;
      rotate.y.value = (state as CropZoomState<number>).rotateY;
      rotation.value = (state as CropZoomState<number>).rotate;
    }

    if (param === 'snapback') {
      const snapbackState = state as SnapbackZoomState<number>;
      snapbackState.resizedWidth &&
        (resize.width.value = snapbackState.resizedWidth);

      snapbackState.resizedHeight &&
        (resize.height.value = snapbackState.resizedHeight);

      xy.x.value = (state as SnapbackZoomState<number>).x;
      xy.y.value = (state as SnapbackZoomState<number>).y;
    }
  };

  const sharedState = createSharedState();
  return { onUpdate, transform, state: sharedState };
};
