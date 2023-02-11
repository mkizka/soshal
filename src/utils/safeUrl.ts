export const safeUrl = (...args: ConstructorParameters<typeof URL>) => {
  try {
    return new URL(...args);
  } catch {
    return null;
  }
};
