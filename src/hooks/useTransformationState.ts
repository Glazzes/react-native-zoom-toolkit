import { Dimensions } from 'react-native';
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

type TransformNames = 'matrix' | 'translateX' | 'translateY';

type Matrix4x4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

type Transformations = {
  [Name in TransformNames]: Name extends 'matrix' ? Matrix4x4 : number;
};

type Transforms3d =
  | Pick<Transformations, 'matrix'>
  | Pick<Transformations, 'translateX'>
  | Pick<Transformations, 'translateY'>;

type TransformationState<T extends ComponentSelection> = {
  onUpdate: (state: StateSelection<T, number>) => void;
  state: StateSelection<T, SharedValue<number>>;
  transform: Readonly<SharedValue<Transforms3d[]>>;
};

const { width, height } = Dimensions.get('window');
const initialPosition = -1 * Math.max(width, height);

export const useTransformationState = <T extends ComponentSelection>(
  param: T
): TransformationState<T> => {
  const size = useSizeVector(0, 0);
  const translate = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const xy = useVector(initialPosition, initialPosition);
  const resize = useSizeVector(0, 0);

  const rotate = useVector(0, 0);
  const rotation = useSharedValue<number>(0);

  // Matrices taken from https://stackoverflow.com/questions/77616182/x-rotation-looks-weird
  const transform = useDerivedValue<Transforms3d[]>(() => {
    const r = rotation.value;
    const rx = rotate.x.value;
    const ry = rotate.y.value;
    const sc = scale.value;

    // Precalculated matrix for scale, rotate, rotateX and rotateY transformations.
    const matrix = [] as unknown as Matrix4x4;
    matrix[0] = sc * Math.cos(ry) * Math.cos(r);
    matrix[1] =
      sc * Math.sin(ry) * Math.sin(rx) * Math.cos(r) -
      sc * Math.cos(rx) * Math.sin(r);
    matrix[2] =
      sc * Math.sin(rx) * Math.sin(r) +
      sc * Math.sin(ry) * Math.cos(rx) * Math.cos(r);
    matrix[3] = 0;

    matrix[4] = sc * Math.cos(ry) * Math.sin(r);
    matrix[5] =
      sc * Math.cos(rx) * Math.cos(r) +
      sc * Math.sin(ry) * Math.sin(rx) * Math.sin(r);
    matrix[6] =
      sc * Math.sin(ry) * Math.cos(rx) * Math.sin(r) -
      sc * Math.sin(rx) * Math.cos(r);
    matrix[7] = 0;

    matrix[8] = -1 * Math.sin(ry);
    matrix[9] = Math.cos(ry) * Math.sin(rx);
    matrix[10] = Math.cos(ry) * Math.cos(rx);
    matrix[11] = 0;

    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    matrix[15] = 1;

    return [
      { translateX: translate.x.value },
      { translateY: translate.y.value },
      { matrix },
    ];
  }, [translate, scale, rotation, rotate]);

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
      const cropState = state as CropZoomState<number>;
      rotate.x.value = cropState.rotateX;
      rotate.y.value = cropState.rotateY;
      rotation.value = cropState.rotate;
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
