import { describe, expect, test } from "vitest";
import { countKnownLines } from "../scripts/credits/generate.mjs";
import { sortContributors } from "../src/client/credits/contributors";

describe("credits contributor data", () => {
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
      "Alice",
      "Bob",
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
});
