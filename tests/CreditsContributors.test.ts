import { describe, expect, test, vi } from "vitest";
import {
  countKnownLines,
  githubStatistics,
  mergeGithubStatistics,
  mergePreviousTotals,
} from "../scripts/credits/generate.mjs";
import { sortContributors } from "../src/client/credits/contributors";

describe("credits contributor data", () => {
  test("retries pending statistics and checks official main before and after", async () => {
    const rows = [{ author: { id: 1 }, weeks: [{ a: 3, d: 2 }] }];
    let calls = 0;
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.endsWith("/commits/main"))
        return new Response(JSON.stringify({ sha: "abc" }));
      if (url.endsWith("/stats/contributors")) {
        calls++;
        return calls === 1
          ? new Response(null, { status: 202 })
          : new Response(JSON.stringify(rows));
      }
      return new Response(JSON.stringify({ default_branch: "main" }));
    });
    const wait = vi.fn(async () => {});
    expect(await githubStatistics("abc", fetchMock, wait)).toEqual(rows);
    expect(wait).toHaveBeenCalledOnce();
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith("/commits/main"),
      ),
    ).toHaveLength(2);
  });

  test("does not use GitHub statistics when official main changed", async () => {
    let heads = 0;
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.endsWith("/commits/main"))
        return new Response(
          JSON.stringify({ sha: heads++ === 0 ? "abc" : "new" }),
        );
      if (url.endsWith("/stats/contributors")) return new Response("[]");
      return new Response(JSON.stringify({ default_branch: "main" }));
    });
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(await githubStatistics("abc", fetchMock)).toBeNull();
    } finally {
      warning.mockRestore();
    }
  });
  test("combines GitHub statistics by ID without double counting or treating zero as evidence", () => {
    const users = [
      { id: 1, login: "alice" },
      { id: 2, login: "bob" },
      { id: 3, login: "carol" },
    ];
    const local = new Map([
      ["alice", 12],
      ["bob", 40],
    ]);
    const statistics = [
      {
        author: { id: 1 },
        weeks: [
          { a: 5, d: 4 },
          { a: 6, d: 5 },
        ],
      },
      { author: { id: 2 }, weeks: [{ a: 3, d: 2 }] },
      { author: { id: 3 }, weeks: [{ a: 0, d: 0 }] },
      { author: { id: 999 }, weeks: [{ a: 20, d: 10 }] },
      { author: { id: 3 }, weeks: [{ a: -1, d: 2 }] },
    ];
    expect([...mergeGithubStatistics(local, users, statistics)]).toEqual([
      ["alice", 20],
      ["bob", 40],
    ]);
    expect([...local]).toEqual([
      ["alice", 12],
      ["bob", 40],
    ]);
    expect([...mergeGithubStatistics(local, users, null)]).toEqual([...local]);
  });
  test("counts only safely matched GitHub noreply commits and ignores binary files", () => {
    const log =
      "\0a@example.com\0\n100\t100\tfile\n\0" +
      "42+oldname@users.noreply.github.com\0\n3\t2\tfile\n-\t-\timage\n\0" +
      "alice@users.noreply.github.com\0\n1\t4\tfile\n\0" +
      "999+alice@users.noreply.github.com\0\n50\t0\tfile\n";
    const counts = countKnownLines(log, [{ id: 42, login: "alice" }]);
    expect([...counts.entries()]).toEqual([["alice", 10]]);
  });

  test("sorts alphabetically or by known lines, keeping missing totals last", () => {
    const contributors = [
      { login: "Zoe", url: "", knownLinesChanged: null },
      { login: "Bob", url: "", knownLinesChanged: 9 },
      { login: "Alice", url: "", knownLinesChanged: 4 },
    ];
    expect(
      sortContributors(contributors, "alphabetical").map((p) => p.login),
    ).toEqual(["Alice", "Bob", "Zoe"]);
    expect(sortContributors(contributors).map((p) => p.login)).toEqual([
      "Bob",
      "Alice",
      "Zoe",
    ]);
    expect(
      sortContributors(contributors, "known-lines").map((p) => p.login),
    ).toEqual(["Bob", "Alice", "Zoe"]);
    expect(contributors[0].login).toBe("Zoe");
    expect(
      sortContributors(contributors, "alphabetical", ["bOB"]).map(
        (p) => p.login,
      ),
    ).toEqual(["Alice", "Zoe"]);
  });

  test("excludes configured bot accounts regardless of case", () => {
    const contributors = [
      { login: "Dependabot[bot]", url: "", knownLinesChanged: 5 },
      { login: "claude[bot]", url: "", knownLinesChanged: null },
      { login: "Alice", url: "", knownLinesChanged: 1 },
    ];
    expect(
      sortContributors(contributors).map((person) => person.login),
    ).toEqual(["Alice"]);
  });

  test("keeps larger ancestor totals without adding them, including renamed accounts", () => {
    const current = [
      { login: "Alice", githubId: 1, knownLinesChanged: null },
      { login: "Bob", githubId: 2, knownLinesChanged: 7 },
      { login: "NewName", githubId: 3, knownLinesChanged: 12 },
      { login: "Dana", githubId: 4, knownLinesChanged: null },
    ];
    const previous = [
      { login: "alice", knownLinesChanged: 10 },
      { login: "Bob", githubId: 2, knownLinesChanged: 9 },
      { login: "OldName", githubId: 3, knownLinesChanged: 5 },
      { login: "Dana", githubId: 99, knownLinesChanged: 20 },
      { login: "Missing", githubId: 5, knownLinesChanged: 6 },
    ];
    const result = mergePreviousTotals(current, previous, true);
    expect(result.map((p) => p.knownLinesChanged)).toEqual([
      10,
      9,
      12,
      null,
      6,
    ]);
    expect(result.map((p) => p.login)).toEqual([
      "Alice",
      "Bob",
      "NewName",
      "Dana",
      "Missing",
    ]);
    expect(mergePreviousTotals(current, previous, false)).toEqual(current);
  });
});
