import { afterEach, expect, test, vi } from "vitest";
import { animateCredits } from "../../src/client/credits/CreditsAnimation";
import { prefersReducedMotion } from "../../src/client/utilities/ReducedMotion";

vi.mock("../../src/client/utilities/ReducedMotion", () => ({
  prefersReducedMotion: vi.fn(),
}));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

test("does not start automatic scrolling when reduced motion is enabled", () => {
  vi.mocked(prefersReducedMotion).mockReturnValue(true);
  const frame = vi.fn();
  vi.stubGlobal("requestAnimationFrame", frame);
  const stop = animateCredits(document.createElement("div"), vi.fn());
  expect(frame).not.toHaveBeenCalled();
  stop();
});

test("stops scrolling and reveals sections if reduced motion is enabled later", () => {
  vi.useFakeTimers();
  vi.mocked(prefersReducedMotion).mockReturnValue(false);
  const query = new EventTarget();
  const cancel = vi.fn();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => query),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 42),
  );
  vi.stubGlobal("cancelAnimationFrame", cancel);
  const container = document.createElement("div");
  container.innerHTML = "<section data-credits-section>Credits</section>";
  const section = container.querySelector<HTMLElement>("section")!;
  const complete = vi.fn();
  const stop = animateCredits(container, complete);
  expect(section.style.opacity).toBe("0");
  const change = new Event("change");
  Object.defineProperty(change, "matches", { value: true });
  query.dispatchEvent(change);
  expect(cancel).toHaveBeenCalledWith(42);
  expect(section.style.opacity).toBe("");
  vi.runAllTimers();
  expect(complete).not.toHaveBeenCalled();
  stop();
});
