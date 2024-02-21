import React, { createContext } from 'react';
import { useVector } from '../../../../src/hooks/useVector';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { maxDimension, theme } from '../../constants';

export type Context = {
  width: SharedValue<number>;
  height: SharedValue<number>;
  backgroundColor: SharedValue<string>;
  x: SharedValue<number>;
  y: SharedValue<number>;
};

export const ReflectionContext = createContext<Context>({} as Context);

export const ReflectionProvider: React.FC = ({ children }) => {
  const position = useVector(-1 * maxDimension);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
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
      {children}
    </ReflectionContext.Provider>
  );
};
