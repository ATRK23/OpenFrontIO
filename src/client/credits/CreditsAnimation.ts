import { prefersReducedMotion } from "../utilities/ReducedMotion";
import { creditsPresentation as config } from "./presentation";

/** Animate the credits until the returned cleanup function is called. */
export function animateCredits(
  container: HTMLElement,
  onComplete: () => void,
): () => void {
  if (prefersReducedMotion()) return () => {};

  const sections = container.querySelectorAll<HTMLElement>(
    "[data-credits-section]",
  );
  const farewell = container.querySelector<HTMLElement>(
    "[data-credits-farewell]",
  );
  const timers: number[] = [];
  const abort = new AbortController();
  let frame = 0;
  let endingTimer: number | undefined;
  let endingAnimation: Animation | undefined;
  let lastTime: number | undefined;
  let motionStart: number | undefined;
  let position = container.scrollTop;
  const welcomeStartMs = config.modalFadeMs + config.messageDelayMs;
  const sectionStartMs =
    welcomeStartMs + config.fadeDurationMs + config.sectionDelayMs;
  let resumeAt = performance.now() + sectionStartMs + config.fadeDurationMs;

  container
    .querySelector<HTMLElement>("[data-credits-welcome]")
    ?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: config.fadeDurationMs,
      delay: welcomeStartMs,
      easing: "ease",
      fill: "both",
    });

  sections.forEach((section, index) => {
    section.style.opacity = "0";
    section.style.transition = `opacity ${config.fadeDurationMs}ms ease`;
    timers.push(
      window.setTimeout(
        () => {
          section.style.opacity = "1";
        },
        sectionStartMs + index * config.sectionDelayMs,
      ),
    );
  });

  const pause = () => {
    if (endingTimer !== undefined) {
      clearTimeout(endingTimer);
      endingTimer = undefined;
    }
    endingAnimation?.cancel();
    endingAnimation = undefined;
    resumeAt = Math.max(resumeAt, performance.now() + config.resumeDelayMs);
    position = container.scrollTop;
    lastTime = undefined;
    motionStart = undefined;
  };
  for (const event of [
    "wheel",
    "touchstart",
    "touchmove",
    "pointerdown",
  ] as const) {
    container.addEventListener(event, pause, {
      passive: true,
      signal: abort.signal,
    });
  }
  container.addEventListener(
    "pointermove",
    (event) => {
      if (event.buttons) pause();
    },
    { passive: true, signal: abort.signal },
  );
  container.ownerDocument.addEventListener(
    "keydown",
    (event) => {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        pause();
    },
    { signal: abort.signal },
  );

  const tick = (time: number) => {
    if (time >= resumeAt && lastTime !== undefined) {
      motionStart ??= time;
      const containerRect = container.getBoundingClientRect();
      const farewellRect = farewell?.getBoundingClientRect();
      const distance = farewellRect
        ? (farewellRect.top +
            farewellRect.bottom -
            containerRect.top -
            containerRect.bottom) /
          2
        : Infinity;
      if (distance <= 1) {
        endingTimer ??= window.setTimeout(() => {
          endingAnimation = farewell?.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            {
              duration: config.fadeDurationMs,
              easing: "ease",
              fill: "forwards",
            },
          );
          endingTimer = window.setTimeout(
            onComplete,
            config.fadeDurationMs + config.messageDelayMs,
          );
        }, config.endingPauseMs);
      } else {
        const acceleration = Math.min(
          (time - motionStart) / config.accelerationMs,
          1,
        );
        const slowdown = Math.max(
          0.08,
          Math.min(distance / config.slowdownDistancePx, 1),
        );
        position += Math.min(
          distance,
          (config.scrollPixelsPerSecond *
            acceleration *
            slowdown *
            Math.min(time - lastTime, 100)) /
            1000,
        );
        container.scrollTop = position;
      }
    } else {
      position = container.scrollTop;
    }
    lastTime = time;
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => {
    abort.abort();
    timers.forEach(clearTimeout);
    if (endingTimer !== undefined) clearTimeout(endingTimer);
    cancelAnimationFrame(frame);
  };
}
