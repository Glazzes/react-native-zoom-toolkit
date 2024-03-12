type InvalidCropSizeOptions = {
  dimension: 'width' | 'height';
  actual: number;
  expected: number;
};

export const getInvalidCropSizeMessage = (options: InvalidCropSizeOptions) => {
  const { dimension, actual, expected } = options;
  return `CropZoom inferred a max crop ${dimension} of ${expected}, but received a crop ${dimension} of ${actual}, your cropSize property's ${dimension} has been clamped to ${expected}`;
};
