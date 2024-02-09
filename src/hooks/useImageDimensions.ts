import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { type CanvasSize, type Source } from '../types';

export const useImageDimensions = (source: Source) => {
  const deps = JSON.stringify(source);
  const [dimensions, setDimensions] = useState<CanvasSize>();
  const [error, setError] = useState<Error>();

  const handleSizeChange = (width: number, height: number): void => {
    setDimensions({ width, height });
  };

  const handleError = (e: Error): void => {
    setError(e);
  };

  useEffect(() => {
    if (source.headers === undefined) {
      Image.getSize(source.uri, handleSizeChange, handleError);
      return;
    }

    Image.getSizeWithHeaders(
      source.uri,
      source.headers,
      handleSizeChange,
      handleError
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);

  return { dimensions, error };
};
