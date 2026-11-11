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
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  vi.restoreAllMocks();
});

test("announces opening and closing once for the music controller", () => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.dispatchEvent(new Event("close"));
    },
  });
  const opened = vi.fn();
  const closed = vi.fn();
  document.addEventListener("credits-opened", opened);
  document.addEventListener("credits-closed", closed);
  try {
    openCredits();
    expect(opened).toHaveBeenCalledOnce();
    document
      .querySelector("#credits-dialog")!
      .dispatchEvent(new Event("cancel", { cancelable: true }));
    expect(closed).toHaveBeenCalledOnce();
  } finally {
    document.removeEventListener("credits-opened", opened);
    document.removeEventListener("credits-closed", closed);
  }
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
  const world = document.querySelector<HTMLImageElement>(
    'img[src*="maps/world/w2kland"]',
  )!;
  const brain = document.querySelector<HTMLImageElement>(
    'img[src*="maps/brainrot/brainland"]',
  )!;
  const maps = document.querySelector("[data-map-attributions]")!;
  expect(world.compareDocumentPosition(translations!)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  expect(translations!.compareDocumentPosition(brain)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  expect(
    brain.compareDocumentPosition(maps) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(translations?.textContent).toContain("French");
  expect(translations?.textContent).toContain("German (Switzerland)");
  expect(translations?.textContent).toContain("cldprv, gx21, r3ms, Eiwalis");
  const languageNames = Array.from(
    translations?.querySelectorAll("[data-translator-language]") ?? [],
    (heading) => heading.textContent!.trim(),
  );
  expect(languageNames).toEqual(
    [...languageNames].sort(new Intl.Collator("en").compare),
  );
  const icons =
    translations?.querySelectorAll("[data-translator-language] img") ?? [];
  expect(icons).toHaveLength(languageNames.length);
  expect(
    Array.from(icons).every((icon) => icon.getAttribute("alt") === ""),
  ).toBe(true);
  expect(
    document.querySelector("[data-credits-logo]")?.getAttribute("src"),
  ).toContain("OpenFrontLogo.svg");
  expect(
    document.querySelector("[data-credits-farewell]")?.textContent,
  ).toContain("❤️");
  expect(maps?.textContent).toContain("OpenStreetMap");
  expect(maps?.textContent).not.toContain("The Noun Project");
  expect(maps?.textContent).not.toContain("FFA Rating");
  expect(
    document.querySelector(
      'a[href="https://github.com/openfrontio/OpenFrontIO/blob/main/CONTRIBUTING.md"]',
    ),
  ).not.toBeNull();
  expect(
    document.querySelector(
      'a[href="https://crowdin.com/project/openfront-mls"]',
    ),
  ).not.toBeNull();
});
