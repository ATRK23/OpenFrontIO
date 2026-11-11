import { execFileSync } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repo = "openfrontio/OpenFrontIO";

// Only GitHub's noreply addresses can be associated without guessing or
// publishing an author's email address. Other commits remain unassigned.
export function countKnownLines(log, users) {
  const byId = new Map(users.map((user) => [String(user.id), user.login]));
  const byLogin = new Map(
    users.map((user) => [user.login.toLowerCase(), user.login]),
  );
  const counts = new Map();
  const parts = log.split("\0");
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const match = parts[i]
      .trim()
      .match(/^(?:(\d+)\+)?([^@]+)@users\.noreply\.github\.com$/i);
    if (!match) continue;
    const login = match[1]
      ? byId.get(match[1])
      : byLogin.get(match[2].toLowerCase());
    if (!login) continue;
    let lines = 0;
    for (const row of parts[i + 1].split("\n")) {
      const stat = row.match(/^(\d+)\t(\d+)\t/);
      if (stat) lines += Number(stat[1]) + Number(stat[2]);
    }
    counts.set(login, (counts.get(login) ?? 0) + lines);
  }
  return counts;
}

// Both snapshots cover full histories: adding them would count commits twice.
export function mergePreviousTotals(current, previous, isAncestor) {
  if (!isAncestor || !Array.isArray(previous)) return current;
  const valid = previous.filter(
    (person) =>
      typeof person?.login === "string" &&
      (person.knownLinesChanged === null ||
        (Number.isSafeInteger(person.knownLinesChanged) &&
          person.knownLinesChanged >= 0)),
  );
  const byId = new Map(
    valid
      .filter((person) => Number.isSafeInteger(person.githubId))
      .map((person) => [person.githubId, person]),
  );
  // The original checked-in snapshot predates account IDs.
  const legacyByLogin = new Map(
    valid
      .filter((person) => person.githubId === undefined)
      .map((person) => [person.login.toLowerCase(), person]),
  );
  const used = new Set();
  const merged = current.map((person) => {
    const old =
      byId.get(person.githubId) ??
      legacyByLogin.get(person.login.toLowerCase());
    if (!old) return person;
    used.add(old);
    const oldTotal = old.knownLinesChanged;
    return {
      ...person,
      knownLinesChanged:
        oldTotal === null
          ? person.knownLinesChanged
          : Math.max(person.knownLinesChanged ?? 0, oldTotal),
    };
  });
  const currentLogins = new Set(
    current.map((person) => person.login.toLowerCase()),
  );
  // Keep known accounts when GitHub temporarily omits them; never retain a
  // conflicting old login for a different current account.
  for (const old of valid) {
    if (!used.has(old) && !currentLogins.has(old.login.toLowerCase()))
      merged.push(old);
  }
  return merged;
}

async function githubContributors() {
  const users = [];
  let url = `https://api.github.com/repos/${repo}/contributors?per_page=100`;
  while (url) {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "OpenFront-credits-generator",
    };
    if (process.env.GITHUB_TOKEN)
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const response = await fetch(url, { headers });
    if (!response.ok)
      throw new Error(`GitHub API returned HTTP ${response.status}`);
    const page = await response.json();
    if (!Array.isArray(page))
      throw new Error("Unexpected GitHub contributors response");
    for (const user of page) {
      if (typeof user.login === "string" && Number.isSafeInteger(user.id)) {
        users.push({ id: user.id, login: user.login });
      }
    }
    const next = response.headers
      .get("link")
      ?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
    if (next && new URL(next).origin !== "https://api.github.com")
      throw new Error("Unexpected GitHub pagination URL");
    url = next;
  }
  return users;
}

async function main() {
  const revision = process.argv[2] ?? "upstream/main";
  if (revision.startsWith("-")) throw new Error("Invalid revision");
  const git = (args, options = {}) =>
    execFileSync("git", args, {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      ...options,
    });
  if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true")
    throw new Error("A complete Git history is required");
  const commit = git(["rev-parse", "--verify", `${revision}^{commit}`]).trim();
  const users = await githubContributors();
  if (users.length === 0) throw new Error("GitHub returned no contributors");
  const log = git([
    "log",
    "--no-merges",
    "--numstat",
    "--format=%x00%ae%x00",
    commit,
    "--",
    ".",
    ":(exclude)resources/credits/contributors.json",
  ]);
  const counts = countKnownLines(log, users);
  let contributors = users.map(({ id, login }) => ({
    githubId: id,
    login,
    url: `https://github.com/${encodeURIComponent(login)}`,
    knownLinesChanged: counts.get(login) ?? null,
  }));
  const output = path.resolve("resources/credits/contributors.json");
  let previous;
  try {
    previous = JSON.parse(await readFile(output, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  let isAncestor = false;
  if (
    typeof previous?.commit === "string" &&
    /^[0-9a-f]{40}$/.test(previous.commit)
  ) {
    try {
      git(["merge-base", "--is-ancestor", previous.commit, commit], {
        stdio: "ignore",
      });
      isAncestor = true;
    } catch (error) {
      if (error.status !== 1 && error.status !== 128) throw error;
    }
  }
  contributors = mergePreviousTotals(
    contributors,
    previous?.contributors,
    isAncestor,
  );
  contributors.sort((a, b) =>
    a.login.toLowerCase().localeCompare(b.login.toLowerCase(), "en"),
  );
  // Do not open a PR just because HEAD changed while the data stayed the same.
  if (
    isAncestor &&
    JSON.stringify(contributors) === JSON.stringify(previous?.contributors)
  ) {
    console.log("Contributor data is unchanged.");
    return;
  }
  await mkdir(path.dirname(output), { recursive: true });
  const temporary = `${output}.tmp`;
  await writeFile(
    temporary,
    `${JSON.stringify({ commit, contributors }, null, 2)}\n`,
  );
  await rename(temporary, output);
  console.log(
    `Generated ${contributors.length} contributors from ${commit}; ${counts.size} have identifiable line totals.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(`Credits generation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
