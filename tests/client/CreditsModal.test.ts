import contributorData from "resources/credits/contributors.json";
import { afterEach, expect, test, vi } from "vitest";
import { sortContributors } from "../../src/client/credits/contributors";
import { openCredits } from "../../src/client/credits/CreditsModal";

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
    sortContributors(contributorData.contributors).map(
      (person) => person.login,
    ),
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
  const translations = Array.from(
    document.querySelectorAll("#credits-dialog section"),
  ).find((section) => section.textContent?.includes("Game_Sushi"));
  expect(translations?.textContent).toContain("Français");
  expect(translations?.textContent).toContain("Schweizerdeutsch");
  expect(translations?.textContent).toContain("cldprv, gx21, r3ms, Eiwalis");
});
