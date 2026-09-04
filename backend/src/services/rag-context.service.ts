export function limitContext(
  context: string,
  maxCharacters: number = 10000
): string {
  if (
    context.length <=
    maxCharacters
  ) {
    return context;
  }

  return context.slice(
    0,
    maxCharacters
  );
}