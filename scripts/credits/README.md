# Contributor data

From the repository root, run `node scripts/credits/generate.mjs upstream/main`.
Fetch the official `upstream/main` first; the local remote-tracking branch may be stale.
Pass another local Git revision as the argument if needed. A shallow clone is not supported.
The script reads the public GitHub contributors API (all pages); `GITHUB_TOKEN` is optional.
It writes `resources/credits/contributors.json` only after successful generation.

GitHub's contributor list can be cached and can omit account associations, so it is not a complete
directory of everyone who contributed. Line totals cover additions plus deletions in non-merge commits,
including generated files, for authors identified by GitHub noreply addresses only. Binary file counts
and co-author trailers are not counted. Totals are partial lower bounds, not measures of impact; null
means no safely matched commits. No email addresses are written to the output. The Git revision is
recorded in the output; GitHub's cached list may reflect a different point in time.

The script does not run automatically and the generated list is not yet connected to the modal.
The maintainer-facing sort setting is in `src/client/credits/contributors.ts`; the exclusion list is
in `src/client/credits/exclusions.ts`.
