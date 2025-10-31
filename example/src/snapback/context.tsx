import React, { createContext } from 'react';
import { useVector } from '../../../src/commons/hooks/useVector';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { maxDimension, theme } from '../constants';

export type Context = {
  width: SharedValue<number>;
  height: SharedValue<number>;
  backgroundColor: SharedValue<string>;
  x: SharedValue<number>;
  y: SharedValue<number>;
};

export const ReflectionContext = createContext<Context>({} as Context);

export function ReflectionProvider(props: React.PropsWithChildren) {
  const position = useVector(-1 * maxDimension, -1 * maxDimension);
  const width = useSharedValue<number>(0);
  const height = useSharedValue<number>(0);
  const backgroundColor = useSharedValue<string>(theme.colors.userMessage);

  const context: Context = {
    width,
    height,
    backgroundColor,
    x: position.x,
    y: position.y,
  };

  return (
    <ReflectionContext.Provider value={context}>
      {props.children}
    </ReflectionContext.Provider>
  );
}
