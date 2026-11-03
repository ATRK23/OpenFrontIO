import { html } from "lit";
import { customElement } from "lit/decorators.js";
import creditsMarkdown from "../../CREDITS.md?raw";
import { BaseModal } from "./components/BaseModal";
import { modalHeader } from "./components/ui/ModalHeader";
import { renderMarkdown } from "./Markdown";
import { textDirection, translateText } from "./Utils";

/**
 * The legal attribution text remains in CREDITS.md, its existing source of
 * truth. It is deliberately rendered as-is rather than copied into UI strings:
 * translation must not accidentally alter licence or attribution wording.
 */
@customElement("credits-modal")
export class CreditsModal extends BaseModal {
  protected routerName = "credits";

  protected modalConfig() {
    return {
      fullScreen: true,
      hideHeader: true,
      showScrollToTop: true,
    };
  }

  protected renderBody() {
    return html`
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
          <a
            href="https://github.com/openfrontio/OpenFrontIO/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-6 inline-flex items-center rounded-lg border border-malibu-blue/40 bg-malibu-blue/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-malibu-blue transition-colors hover:bg-malibu-blue/20 hover:text-white"
          >
            ${translateText("credits.github_contributors")}
          </a>
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
}
