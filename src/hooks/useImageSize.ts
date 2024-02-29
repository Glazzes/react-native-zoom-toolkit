import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { type Source } from '../types';
import type { SizeVector } from '../commons/types';

export const useImageSize = (source: Source) => {
  const [size, setSize] = useState<SizeVector<number> | undefined>(undefined);

  const handleSizeChange = (width: number, height: number): void => {
    setSize({ width, height });
  };

  const deps = JSON.stringify(source);
  useEffect(() => {
    if (source.headers === undefined) {
      Image.getSize(source.uri, handleSizeChange);
      return;
    }

    Image.getSizeWithHeaders(source.uri, source.headers, handleSizeChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);

  return { size };
};
