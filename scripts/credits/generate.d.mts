export function countKnownLines(
  log: string,
  users: readonly { id: number; login: string }[],
): Map<string, number>;
