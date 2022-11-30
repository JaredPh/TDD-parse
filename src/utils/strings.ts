export const splitAndTrim = (str: string, char: string): string[] =>
  str.split(char).map((s) => s.trim());
