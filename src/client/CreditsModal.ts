import { html } from "lit";
import { customElement } from "lit/decorators.js";
import creditsMarkdown from "../../CREDITS.md?raw";
import { BaseModal } from "./components/BaseModal";
import { modalHeader } from "./components/ui/ModalHeader";
import { githubContributors } from "./generated/CreditsGithubContributors";
import { renderMarkdown } from "./Markdown";
import { prefersReducedMotion } from "./utilities/ReducedMotion";
import { textDirection, translateText } from "./Utils";

const EXIT_ANIMATION_MS = 180;
const TEXT_FADE_IN_MS = 450;
const LAST_CREDITS_DELAY_MS = 2_900;
const AUTO_SCROLL_DELAY_MS = LAST_CREDITS_DELAY_MS + TEXT_FADE_IN_MS;
const AUTO_SCROLL_RESUME_DELAY_MS = 5_000;
const AUTO_SCROLL_PIXELS_PER_SECOND = 50;
const MAX_AUTO_SCROLL_FRAME_MS = 100;

/**
 * The legal attribution text remains in CREDITS.md, its existing source of
 * truth. It is deliberately rendered as-is rather than copied into UI strings:
 * translation must not accidentally alter licence or attribution wording.
 */
@customElement("credits-modal")
export class CreditsModal extends BaseModal {
  protected routerName = "credits";

  private closing = false;
  private autoScrollTimer: ReturnType<typeof setTimeout> | undefined;
  private autoScrollFrame: number | undefined;
  private lastScrollFrameAt: number | undefined;
  private autoScrollPosition = 0;
  private scrollContainer: HTMLElement | undefined;
  private expectedAutoScrollTop: number | undefined;

  protected modalConfig() {
    return {
      fullScreen: true,
      hideHeader: true,
      showScrollToTop: true,
    };
  }

  protected renderBody() {
    return html`
      <style>
        @keyframes credits-overlay-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes credits-overlay-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes credits-copy-in {
          from {
            opacity: 0;
            transform: translateY(1.25rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        credits-modal.credits-entering > o-modal {
          animation: credits-overlay-in 250ms ease-out both;
        }
        credits-modal.credits-leaving > o-modal {
          animation: credits-overlay-out ${EXIT_ANIMATION_MS}ms ease-in both;
        }
        credits-modal.credits-entering [data-credits-opening],
        credits-modal.credits-entering [data-credits-section],
        credits-modal.credits-entering [data-credits-closing] {
          opacity: 0;
          animation: credits-copy-in ${TEXT_FADE_IN_MS}ms ease-out both;
        }
        credits-modal.credits-entering [data-credits-opening] {
          animation-delay: 240ms;
        }
        credits-modal.credits-entering [data-credits-section="team"] {
          animation-delay: 800ms;
        }
        credits-modal.credits-entering [data-credits-section="contributors"] {
          animation-delay: 1.5s;
        }
        credits-modal.credits-entering [data-credits-section="legal"] {
          animation-delay: 2.2s;
        }
        credits-modal.credits-entering [data-credits-closing] {
          animation-delay: ${LAST_CREDITS_DELAY_MS}ms;
        }
        @media (prefers-reduced-motion: reduce) {
          credits-modal.credits-entering > o-modal,
          credits-modal.credits-leaving > o-modal,
          credits-modal.credits-entering [data-credits-opening],
          credits-modal.credits-entering [data-credits-section],
          credits-modal.credits-entering [data-credits-closing] {
            animation: none;
          }
        }
      </style>
      <div
        dir=${textDirection()}
        class="mx-auto w-full max-w-6xl px-5 py-10 text-center sm:px-10 sm:py-16 lg:px-16"
      >
        <p
          data-credits-opening
          class="mb-16 text-xl font-medium text-white sm:text-2xl"
        >
          ${translateText("credits.thank_you_for_playing")}
        </p>

        <section data-credits-section="team" aria-labelledby="credits-team">
          <h1
            id="credits-team"
            class="text-sm font-bold uppercase tracking-[0.25em] text-malibu-blue"
          >
            ${translateText("credits.team")}
          </h1>
          <div class="mt-5 border-y border-white/10 px-5 py-8 sm:py-10">
            <a
              href="https://github.com/evanpelle"
              target="_blank"
              rel="noopener noreferrer"
              class="text-2xl font-bold text-white transition-colors hover:text-malibu-blue sm:text-3xl"
            >
              Evan Pelle
            </a>
            <p class="mt-2 text-base text-white/70 sm:text-lg">
              ${translateText("credits.project_maintainer")}
            </p>
          </div>
        </section>

        <section
          data-credits-section="contributors"
          class="mt-16"
          aria-labelledby="credits-contributors"
        >
          <h2
            id="credits-contributors"
            class="text-sm font-bold uppercase tracking-[0.25em] text-malibu-blue"
          >
            ${translateText("credits.community_contributors")}
          </h2>
          <p class="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
            ${translateText("credits.contributors_description")}
          </p>
          <div
            class="mx-auto mt-6 grid max-w-5xl grid-cols-2 justify-items-center gap-x-6 gap-y-2 text-base sm:grid-cols-3 lg:grid-cols-4 sm:text-lg"
          >
            ${githubContributors.map(
              (contributor) => html`
                <a
                  data-github-contributor
                  href=${contributor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-white/80 underline decoration-white/25 underline-offset-4 transition-colors hover:text-malibu-blue hover:decoration-malibu-blue"
                >
                  ${contributor.login}
                </a>
              `,
            )}
          </div>
        </section>

        <section
          data-credits-section="legal"
          class="mt-16 border-t border-white/10 pt-12 text-center"
          aria-labelledby="credits-legal"
        >
          <div class="text-center">
            <h2
              id="credits-legal"
              class="text-sm font-bold uppercase tracking-[0.25em] text-malibu-blue"
            >
              ${translateText("credits.legal_and_other")}
            </h2>
            <p class="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              ${translateText("credits.legal_description")}
            </p>
          </div>
          <div
            class="credits-legal prose prose-invert mx-auto mt-10 max-w-none text-white/75 [&_a]:text-malibu-blue [&_a:hover]:text-aquarius [&_h1]:hidden [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:border-b [&_h2]:border-white/10 [&_h2]:pb-3 [&_h2]:text-3xl [&_h2]:text-white [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:text-white [&_p]:text-base [&_p]:leading-relaxed sm:[&_p]:text-lg"
          >
            ${renderMarkdown(creditsMarkdown)}
          </div>
        </section>

        <p
          data-credits-closing
          class="mt-20 pb-6 text-xl font-medium text-white sm:text-2xl"
        >
          ${translateText("credits.thank_you_for_playing")}
        </p>
      </div>
    `;
  }

  protected renderHeaderSlot() {
    return modalHeader({
      title: translateText("credits.title"),
      onBack: () => this.close(),
      ariaLabel: translateText("common.back"),
    });
  }

  protected onOpen(): void {
    this.stopAutoScroll();
    this.closing = false;
    this.classList.remove("credits-leaving", "credits-entering");
    if (prefersReducedMotion()) return;
    requestAnimationFrame(() => {
      if (!this.isOpen()) return;
      this.bindScrollListener();
      this.classList.add("credits-entering");
      this.scheduleAutoScroll(AUTO_SCROLL_DELAY_MS);
    });
  }

  protected onClose(): void {
    this.stopAutoScroll();
    this.unbindScrollListener();
    this.classList.remove("credits-entering", "credits-leaving");
    this.closing = false;
  }

  public close(args?: Record<string, unknown>): void {
    if (this.closing || !this.isOpen()) return;
    this.stopAutoScroll();
    if (prefersReducedMotion()) {
      super.close(args);
      return;
    }
    this.closing = true;
    this.classList.remove("credits-entering");
    this.classList.add("credits-leaving");
    setTimeout(() => super.close(args), EXIT_ANIMATION_MS);
  }

  disconnectedCallback(): void {
    this.stopAutoScroll();
    this.unbindScrollListener();
    super.disconnectedCallback();
  }

  private startAutoScroll(): void {
    if (!this.isOpen() || this.closing || prefersReducedMotion()) return;
    this.lastScrollFrameAt = undefined;
    this.autoScrollPosition = this.modalEl?.getScrollTop() ?? 0;
    this.expectedAutoScrollTop = undefined;
    this.autoScrollFrame = requestAnimationFrame(this.autoScroll);
  }

  private autoScroll = (now: number): void => {
    const modal = this.modalEl;
    if (modal === undefined || !this.isOpen() || this.closing) return;
    if (this.lastScrollFrameAt === undefined) {
      this.lastScrollFrameAt = now;
      this.autoScrollFrame = requestAnimationFrame(this.autoScroll);
      return;
    }
    const elapsed = Math.min(
      now - this.lastScrollFrameAt,
      MAX_AUTO_SCROLL_FRAME_MS,
    );
    this.lastScrollFrameAt = now;
    this.autoScrollPosition +=
      (elapsed / 1_000) * AUTO_SCROLL_PIXELS_PER_SECOND;
    modal.setScrollTop(this.autoScrollPosition);
    const current = modal.getScrollTop();
    this.expectedAutoScrollTop = current;

    if (
      this.scrollContainer !== undefined &&
      current >=
        this.scrollContainer.scrollHeight - this.scrollContainer.clientHeight
    ) {
      this.autoScrollFrame = undefined;
      return;
    }
    this.autoScrollFrame = requestAnimationFrame(this.autoScroll);
  };

  private bindScrollListener(): void {
    const scrollContainer =
      this.modalEl?.shadowRoot?.querySelector<HTMLElement>(
        "[data-modal-scroll]",
      );
    if (scrollContainer === this.scrollContainer) return;
    this.unbindScrollListener();
    scrollContainer?.addEventListener("scroll", this.handleScroll);
    this.scrollContainer = scrollContainer ?? undefined;
  }

  private unbindScrollListener(): void {
    this.scrollContainer?.removeEventListener("scroll", this.handleScroll);
    this.scrollContainer = undefined;
  }

  private handleScroll = (event: Event): void => {
    const scrollTop = (event.currentTarget as HTMLElement).scrollTop;
    if (scrollTop === this.expectedAutoScrollTop) {
      this.expectedAutoScrollTop = undefined;
      return;
    }
    this.stopAutoScroll();
    if (!this.closing && this.isOpen()) {
      this.scheduleAutoScroll(AUTO_SCROLL_RESUME_DELAY_MS);
    }
  };

  private scheduleAutoScroll(delay: number): void {
    if (this.autoScrollTimer !== undefined) {
      clearTimeout(this.autoScrollTimer);
    }
    this.autoScrollTimer = setTimeout(() => this.startAutoScroll(), delay);
  }

  private stopAutoScroll = (): void => {
    if (this.autoScrollTimer !== undefined) {
      clearTimeout(this.autoScrollTimer);
      this.autoScrollTimer = undefined;
    }
    if (this.autoScrollFrame !== undefined) {
      cancelAnimationFrame(this.autoScrollFrame);
      this.autoScrollFrame = undefined;
    }
    this.lastScrollFrameAt = undefined;
    this.autoScrollPosition = 0;
    this.expectedAutoScrollTop = undefined;
  };
}
