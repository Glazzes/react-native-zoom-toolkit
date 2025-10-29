import { Dimensions } from 'react-native';
import {
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useVector } from '../commons/hooks/useVector';
import { useSizeVector } from '../commons/hooks/useSizeVector';
import type { SnapbackZoomState } from '../components/snapback/types';
import type { CropZoomState } from '../components/crop/types';
import type { CommonZoomState } from '../commons/types';

type ComponentSelection = 'common' | 'snapback' | 'crop';

type StateSelection<C extends ComponentSelection, T> = C extends 'snapback'
  ? SnapbackZoomState<T>
  : C extends 'crop'
  ? CropZoomState<T>
  : CommonZoomState<T>;

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
  const containerSize = useSizeVector(0, 0);
  const childSize = useSizeVector(0, 0);
  const maxScale = useSharedValue<number>(1);

  const translate = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const position = useVector(initialPosition, initialPosition);
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
    const state: StateSelection<T, SharedValue<number>, SharedSize> = {
      translateX: translate.x,
      translateY: translate.y,
      scale: scale,
    };

    if (param === 'common' || param === 'crop') {
      const st = state as CommonZoomState<SharedValue<number>>;

      st.containerSize = {
        width: containerSize.width,
        height: containerSize.height,
      };

      st.childSize = {
        width: childSize.width,
        height: childSize.height,
      };

      st.maxScale = maxScale;
    }

    if (param === 'crop') {
      const st = state as CropZoomState<SharedValue<number>>;

      st.rotateX = rotate.x;
      st.rotateY = rotate.y;
      st.rotate = rotation;
    }

    if (param === 'snapback') {
      const st = state as SnapbackZoomState<SharedValue<number>>;

      st.size = {
        width: containerSize.width,
        height: containerSize.height,
      };

      st.resize = {
        width: resize.width,
        height: resize.height,
      };

      st.position = {
        x: position.x,
        y: position.y,
      };
    }

    return state;
  };

  const onUpdate = (state: StateSelection<T, number>): void => {
    'worklet';

    translate.x.value = state.translateX;
    translate.y.value = state.translateY;
    scale.value = state.scale;

    if (param === 'common' || param === 'crop') {
      const commonState = state as CommonZoomState<number>;

      childSize.width.value = commonState.childSize.width;
      childSize.height.value = commonState.childSize.height;
      containerSize.width.value = commonState.containerSize.width;
      containerSize.height.value = commonState.containerSize.height;
      maxScale.value = commonState.maxScale;
    }

    if (param === 'crop') {
      const cropState = state as CropZoomState<number>;
      rotate.x.value = cropState.rotateX;
      rotate.y.value = cropState.rotateY;
      rotation.value = cropState.rotate;
    }

    if (param === 'snapback') {
      const snapState = state as SnapbackZoomState<number>;

      if (snapState.resize !== undefined) {
        resize.width.value = snapState.resize.width;
        resize.height.value = snapState.resize.height;
      }

      containerSize.width.value = snapState.size.width;
      containerSize.height.value = snapState.size.height;
      position.x.value = snapState.position.x;
      position.y.value = snapState.position.y;
    }
  };

  const sharedState = createSharedState();
  return { onUpdate, transform, state: sharedState };
};
