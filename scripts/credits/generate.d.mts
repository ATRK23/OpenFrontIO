export function countKnownLines(
  log: string,
  users: readonly { id: number; login: string }[],
): Map<string, number>;

export function mergeGithubStatistics(
  localCounts: ReadonlyMap<string, number>,
  users: readonly { id: number; login: string }[],
  statistics: unknown,
): Map<string, number>;

export function githubStatistics(
  commit: string,
  fetchImpl?: typeof fetch,
  wait?: (ms: number) => Promise<void>,
): Promise<unknown[] | null>;

export function mergePreviousTotals<
  T extends {
    login: string;
    githubId?: number;
    knownLinesChanged: number | null;
  },
>(current: T[], previous: unknown, isAncestor: boolean): T[];
