type InvalidChildrenOptions = {
  name: string;
  expected: number;
  actual: number;
};

export const getInvalidChildrenMessage = (options: InvalidChildrenOptions) => {
  const { name, expected, actual } = options;
  return `${name} expected ${expected} children, but received ${actual}`;
};
