import { afterEach, expect, test, vi } from "vitest";
import { animateCredits } from "../../src/client/credits/CreditsAnimation";
import { creditsPresentation } from "../../src/client/credits/presentation";
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

test("a simple pointer press does not interrupt the end of the credits", () => {
  vi.useFakeTimers();
  vi.mocked(prefersReducedMotion).mockReturnValue(false);
  let nextFrame: FrameRequestCallback = () => {};
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 42;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const container = document.createElement("div");
  container.innerHTML = "<div data-credits-farewell>Thank you</div>";
  const farewell = container.querySelector<HTMLElement>(
    "[data-credits-farewell]",
  )!;
  farewell.animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
  const complete = vi.fn();
  const stop = animateCredits(container, complete);
  nextFrame(10000);
  nextFrame(10016);
  container.dispatchEvent(new Event("pointerdown"));
  vi.advanceTimersByTime(
    creditsPresentation.endingPauseMs +
      creditsPresentation.fadeDurationMs +
      creditsPresentation.messageDelayMs,
  );
  expect(complete).toHaveBeenCalledOnce();
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
