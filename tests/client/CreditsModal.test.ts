import { afterEach, expect, test, vi } from "vitest";
import contributorData from "resources/credits/contributors.json";
import { openCredits } from "../../src/client/credits/CreditsModal";
import { sortContributors } from "../../src/client/credits/contributors";

vi.mock("../../src/client/utilities/ReducedMotion", () => ({
  prefersReducedMotion: () => true,
}));

afterEach(() => {
  document.body.innerHTML = "";
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  vi.restoreAllMocks();
});

test("shows contributor profile links and excludes configured bots", () => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: vi.fn(),
  });
  openCredits();
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      "#credits-dialog section ul a",
    ),
  );
  expect(links.length).toBeGreaterThan(0);
  expect(links.map((link) => link.textContent?.trim())).toEqual(
    sortContributors(contributorData.contributors).map((person) => person.login),
  );
  expect(
    links.some((link) => link.textContent?.trim() === "dependabot[bot]"),
  ).toBe(false);
  for (const link of links) {
    expect(link.href).toBe(
      `https://github.com/${encodeURIComponent(link.textContent!.trim())}`,
    );
    expect(link.rel).toContain("noopener");
  }
});
