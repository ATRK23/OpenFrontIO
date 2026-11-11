import { excludedContributors } from "./exclusions";

/** Maintainer-selected display order for the generated contributor list. */
export const contributorSort: "alphabetical" | "known-lines" = "known-lines";

export interface Contributor {
  login: string;
  url: string;
  knownLinesChanged: number | null;
}

export function sortContributors(
  contributors: readonly Contributor[],
  order: "alphabetical" | "known-lines" = contributorSort,
  exclusions: readonly string[] = excludedContributors,
): Contributor[] {
  const excluded = new Set(exclusions.map((login) => login.toLowerCase()));
  return contributors
    .filter((person) => !excluded.has(person.login.toLowerCase()))
    .sort((a, b) => {
      if (order === "known-lines") {
        const difference =
          (b.knownLinesChanged ?? -1) - (a.knownLinesChanged ?? -1);
        if (difference !== 0) return difference;
      }
      return a.login.localeCompare(b.login, "en", { sensitivity: "base" });
    });
}
