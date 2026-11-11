# Contributor data

From the repository root, run `node scripts/credits/generate.mjs upstream/main`.
Fetch the official `upstream/main` first; the local remote-tracking branch may be stale.
Pass another local Git revision as the argument if needed. A shallow clone is not supported.
The script reads the public GitHub contributors API (all pages); `GITHUB_TOKEN` is optional.
It also tries GitHub's contributor statistics when the selected revision matches the current
official `main`. GitHub may need time to calculate them or be unavailable; in those cases the
script uses the local calculation and the previous snapshot instead. GitHub reports zero line
counts for repositories with at least 10,000 commits, so zeros are not treated as usable totals.
matching `main` before and after the request reduces, but cannot eliminate, timing uncertainty.
It writes `resources/credits/contributors.json` only after successful generation.

GitHub's contributor list can be cached and can omit account associations, so it is not a complete
directory of everyone who contributed. Line totals cover additions plus deletions in non-merge commits,
including generated files other than the contributor snapshot itself, for authors identified by GitHub noreply addresses only. Binary file counts
and co-author trailers are not counted in the local calculation. Totals are approximate and not
measures of impact; null means neither source provided a usable count. No email addresses are written to the output. The Git revision is
recorded in the output; GitHub's cached list may reflect a different point in time.

The generated list is displayed in the credits modal. The maintainer-facing sort setting is in
`src/client/credits/contributors.ts`; the exclusion list is in `src/client/credits/exclusions.ts`.

The standalone `credits-contributors.yml` workflow runs on pushes to `main` and `credits-page`,
and on manual dispatch for those branches. Each run fetches official `main` and calculates for its
latest fetched commit; the PR still targets the branch that triggered it. It maintains a separate pull request targeting each
branch only if contributor data changed. A push that only updates the
generated JSON is ignored to prevent a loop. The data reaches production only after the PR is
merged and a version containing it is deployed. API failures fail the workflow without replacing
the previous file.

Both totals cover overlapping full histories, so they are never added together. If the previous
snapshot's commit is an ancestor of the chosen revision, the generator keeps the larger known total
and retains accounts temporarily absent from the GitHub response. New snapshots match accounts by
GitHub ID; the original snapshot has no IDs and is matched by login, which can be ambiguous if a
login was reused. Retained missing accounts may be stale. A divergent or older history does not
inherit previous totals. This is a conservative display history, not a precise measure of impact.

The workflow needs `contents: write` and `pull-requests: write`, and repository settings must allow
GitHub Actions to create pull requests. Maintainers must review compatibility with the PR gate:
`github-actions[bot]` is not in its trusted-bot list, and the generated PR needs a milestone. PR
checks triggered by `GITHUB_TOKEN` may require maintainer approval. No gate or deployment workflow
is modified by this automation.
