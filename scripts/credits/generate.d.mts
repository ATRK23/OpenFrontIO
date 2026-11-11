export function countKnownLines(
  log: string,
  users: readonly { id: number; login: string }[],
): Map<string, number>;

export function mergePreviousTotals<
  T extends {
    login: string;
    githubId?: number;
    knownLinesChanged: number | null;
  },
>(current: T[], previous: unknown, isAncestor: boolean): T[];
