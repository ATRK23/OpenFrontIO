import { assetUrl } from "@openfront/shared/AssetUrls";
import { html, render } from "lit";
import contributorData from "resources/credits/contributors.json";
import languageMetadata from "resources/lang/metadata.json";
import creditsMarkdown from "../../../CREDITS.md?raw";
import translatorsMarkdown from "../../../TRANSLATORS.md?raw";
import { renderMarkdown } from "../Markdown";
import "../components/baseComponents/Button";
import { prefersReducedMotion } from "../utilities/ReducedMotion";
import { translateText } from "../Utils";
import { sortContributors } from "./contributors";
import { animateCredits } from "./CreditsAnimation";
import { featuredPeople } from "./people";
import { creditsPresentation } from "./presentation";

/** Match the language picker's icon while keeping the English heading. */
function translatorLanguage(englishName: string): {
  name: string;
  icon?: string;
} {
  const code = englishName === "German (Switzerland)" ? "de-CH" : undefined;
  const language = languageMetadata.find((entry) =>
    code ? entry.code === code : entry.en === englishName,
  );
  return { name: englishName, icon: language?.svg };
}

/** Opens the credits over the homepage without loading them on startup. */
export function openCredits(): void {
  if (document.querySelector("#credits-dialog")) return;

  let previouslyFocused = document.activeElement;
  while (previouslyFocused?.shadowRoot?.activeElement) {
    previouslyFocused = previouslyFocused.shadowRoot.activeElement;
  }
  const dialog = document.createElement("dialog");
  dialog.id = "credits-dialog";
  dialog.className =
    "fixed inset-0 m-0 flex h-[100dvh] w-full max-w-none max-h-none select-none flex-col bg-zinc-950/95 text-white p-0";
  dialog.setAttribute("aria-labelledby", "credits-title");
  const collator = new Intl.Collator("en");
  const translatorSections = translatorsMarkdown
    .split(/(?=^## )/m)
    .slice(1)
    .map((section) => {
      const heading = section.match(/^## (.+)$/m)?.[1]?.trim() ?? "";
      return {
        ...translatorLanguage(heading),
        body: section.replace(/^## .+\r?\n/, ""),
      };
    })
    .sort((a, b) => collator.compare(a.name, b.name));
  let closing = false;
  let musicEnded = false;
  const endCreditsMusic = () => {
    if (musicEnded) return;
    musicEnded = true;
    document.dispatchEvent(new Event("credits-closed"));
  };
  const closeCredits = (automatic = false) => {
    if (closing) return;
    closing = true;
    endCreditsMusic();
    stopAnimation();
    const closeDialog = () => {
      dialog.close();
      if (automatic && previouslyFocused instanceof HTMLElement) {
        previouslyFocused.blur();
      }
    };
    if (prefersReducedMotion()) {
      closeDialog();
      return;
    }
    dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: creditsPresentation.modalFadeMs,
      easing: "ease",
      fill: "forwards",
    }).onfinish = closeDialog;
  };
  render(
    html`<header
        class="absolute inset-x-0 top-0 z-10 isolate flex items-center justify-between gap-3 p-4 sm:p-6"
      >
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 -z-10 bg-zinc-950/60 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_60%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
        ></div>
        <h1 id="credits-title" class="text-2xl font-bold">
          ${translateText("game_starting_modal.credits")}
        </h1>
        <o-button
          translationKey="common.close"
          variant="secondary"
          size="sm"
          @click=${() => closeCredits()}
        ></o-button>
      </header>
      <main
        tabindex="0"
        autofocus
        class="hide-scrollbar min-h-0 flex-1 overflow-y-auto scroll-pt-24 px-4 sm:px-6 text-center outline-none"
      >
        <div class="mb-48 flex min-h-full items-center justify-center sm:mb-64">
          <img
            data-credits-logo
            src=${assetUrl("images/OpenFrontLogo.svg")}
            alt="OpenFront"
            draggable="false"
            class="w-[85%] max-w-3xl max-h-[50vh] object-contain"
          />
        </div>
        <section data-credits-section class="mb-24 sm:mb-32">
          <h2 class="mb-6 text-3xl sm:text-4xl font-bold text-blue-200">
            ${translateText("credits.team")}
          </h2>
          ${featuredPeople.map(
            (person) =>
              html`<p class="mb-6 text-3xl font-semibold sm:text-4xl">
                ${
                  person.url
                    ? html`<a
                        class="text-inherit hover:underline"
                        href=${person.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        >${person.name}</a
                      >`
                    : person.name
                }
                <span
                  class="mt-2 block text-xl font-normal text-white/60 sm:text-2xl"
                  >${translateText(person.roleKey)}</span
                >
              </p>`,
          )}
          ${featuredPeople.length === 0 ? html`<p class="text-white/60">${translateText("credits.team_pending")}</p>` : null}
        </section>
        <section data-credits-section class="mb-24 sm:mb-32">
          <h2 class="mb-6 text-3xl sm:text-4xl font-bold text-blue-200">
            ${translateText("credits.contributors")}
          </h2>
          <ul
            class="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-3 text-justify text-lg [text-align-last:center] sm:grid-cols-3 sm:text-xl"
          >
            ${sortContributors(contributorData.contributors).map(
              (person) =>
                html`<li class="min-w-0 break-words">
                  <a
                    class="text-inherit hover:underline"
                    href=${`https://github.com/${encodeURIComponent(person.login)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    >${person.login}</a
                  >
                </li>`,
            )}
          </ul>
          <a
            class="mt-8 inline-block text-lg text-inherit underline hover:text-blue-200 sm:text-xl"
            href="https://github.com/openfrontio/OpenFrontIO/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            >${translateText("credits.contribute_code")}</a
          >
        </section>
        <figure
          data-credits-section
          class="mx-auto mb-24 w-full max-w-5xl sm:mb-32"
        >
          <img
            src=${assetUrl("maps/world/w2kland.webp")}
            alt=${translateText("map.world")}
            draggable="false"
            width="2064"
            height="1032"
            loading="lazy"
            decoding="async"
            class="h-auto w-full rounded-xl"
          />
        </figure>
        <section data-credits-section class="mb-24 sm:mb-32">
          <h2 class="mb-6 text-3xl sm:text-4xl font-bold text-blue-200">
            ${translateText("credits.translators")}
          </h2>
          <div
            class="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-6 break-words text-lg sm:grid-cols-2 sm:text-xl lg:grid-cols-3 [&_p]:mt-2"
          >
            ${translatorSections.map(
              (section) =>
                html`<div dir="auto">
                  <h2
                    data-translator-language
                    class="text-center text-2xl font-semibold text-blue-100"
                  >
                    ${
                      section.icon
                        ? html`<img
                            class="inline-block h-5 w-7 object-contain align-middle"
                            src=${assetUrl(`flags/${section.icon}.svg`)}
                            alt=""
                            draggable="false"
                          />`
                        : null
                    }
                    ${section.name}
                  </h2>
                  ${renderMarkdown(section.body)}
                </div>`,
            )}
          </div>
          <a
            class="mt-8 inline-block text-lg text-inherit underline hover:text-blue-200 sm:text-xl"
            href="https://crowdin.com/project/openfront-mls"
            target="_blank"
            rel="noopener noreferrer"
            >${translateText("credits.contribute_translation")}</a
          >
        </section>
        <figure
          data-credits-section
          class="mx-auto mb-24 w-full max-w-2xl sm:mb-32"
        >
          <img
            src=${assetUrl("maps/brainrot/brainland.webp")}
            alt=${translateText("map.brainrot")}
            draggable="false"
            width="2996"
            height="2352"
            loading="lazy"
            decoding="async"
            class="h-auto w-full rounded-xl"
          />
        </figure>
        <section data-credits-section>
          <h2 class="mb-6 text-3xl sm:text-4xl font-bold text-blue-200">
            ${translateText("credits.licenses")}
          </h2>
          <div
            class="mx-auto max-w-6xl break-words text-center text-lg leading-relaxed sm:text-xl [&_a]:text-inherit [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-blue-200 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-blue-100 [&_p]:my-3 [&_ul]:list-inside [&_ul]:list-disc"
          >
            ${creditsMarkdown
              .replace(/^# Credits\s*\r?\n/, "")
              .split(/(?=^## )/m)
              .filter((section) => section.trim())
              .map((section) => {
                if (!/^## Map Data\s*$/m.test(section)) {
                  return html`<div>${renderMarkdown(section)}</div>`;
                }
                const [heading, ...maps] = section.split(/(?=^### )/m);
                return html`<div>${renderMarkdown(heading)}</div>
                  <div
                    data-map-attributions
                    class="columns-1 gap-12 md:columns-2 md:text-justify md:[text-align-last:center] [&_h3]:text-center"
                  >
                    ${maps.map((map) => html`<div class="break-inside-avoid">${renderMarkdown(map)}</div>`)}
                  </div>`;
              })}
          </div>
        </section>
        <figure
          data-credits-section
          class="mx-auto mt-24 w-full max-w-5xl sm:mt-32"
        >
          <img
            src="/press/images/key-art/openfront_keyart_1200x675_branded.jpg"
            alt="OpenFront"
            draggable="false"
            width="1200"
            height="675"
            loading="lazy"
            decoding="async"
            class="h-auto w-full rounded-xl"
          />
        </figure>
        <div
          class="mt-40 flex min-h-full items-center justify-center text-3xl font-bold sm:mt-48 sm:text-4xl"
        >
          <div data-credits-farewell>
            <p>${translateText("credits.thanks_for_playing")}</p>
            <span
              data-credits-heart
              class="mt-4 block text-5xl sm:text-6xl"
              aria-hidden="true"
              >❤️</span
            >
          </div>
        </div>
      </main>`,
    dialog,
  );
  document.body.append(dialog);
  dialog.showModal();
  document.dispatchEvent(new Event("credits-opened"));
  if (!prefersReducedMotion()) {
    dialog.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: creditsPresentation.modalFadeMs,
      easing: "ease",
    });
  }
  const stopAnimation = animateCredits(dialog.querySelector("main")!, () =>
    closeCredits(true),
  );
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCredits();
  });
  dialog.addEventListener(
    "close",
    () => {
      endCreditsMusic();
      stopAnimation();
      dialog.remove();
    },
    { once: true },
  );
}
