import { html, render } from "lit";
import contributorData from "resources/credits/contributors.json";
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
import { nativeTranslatorLanguage } from "./translatorLanguages";

/** Opens the credits over the homepage without loading them on startup. */
export function openCredits(): void {
  if (document.querySelector("#credits-dialog")) return;

  const dialog = document.createElement("dialog");
  dialog.id = "credits-dialog";
  dialog.className =
    "fixed inset-0 m-0 flex h-[100dvh] w-full max-w-none max-h-none flex-col bg-zinc-950/95 text-white p-0";
  dialog.setAttribute("aria-labelledby", "credits-title");
  let closing = false;
  const closeCredits = () => {
    if (closing) return;
    closing = true;
    stopAnimation();
    if (prefersReducedMotion()) {
      dialog.close();
      return;
    }
    dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: creditsPresentation.modalFadeMs,
      easing: "ease",
      fill: "forwards",
    }).onfinish = () => dialog.close();
  };
  render(
    html`<header
        class="flex shrink-0 items-center justify-between gap-3 p-4 sm:p-6 border-b border-white/10"
      >
        <h1 id="credits-title" class="text-2xl font-bold">
          ${translateText("game_starting_modal.credits")}
        </h1>
        <o-button
          translationKey="common.close"
          variant="secondary"
          size="sm"
          @click=${closeCredits}
        ></o-button>
      </header>
      <main
        tabindex="0"
        autofocus
        class="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 text-center"
      >
        <div
          data-credits-welcome
          class="min-h-full flex items-center justify-center text-2xl sm:text-3xl font-bold"
        >
          ${translateText("credits.thanks_for_playing")}
        </div>
        <section data-credits-section class="mb-12">
          <h2 class="mb-6 text-2xl sm:text-3xl font-semibold text-blue-200">
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
        <section data-credits-section class="mb-12">
          <h2 class="mb-4 text-2xl sm:text-3xl font-semibold text-blue-200">
            ${translateText("credits.contributors")}
          </h2>
          <ul
            class="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3"
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
        </section>
        <section data-credits-section class="mb-12">
          <h2 class="mb-4 text-2xl sm:text-3xl font-semibold text-blue-200">
            ${translateText("credits.translators")}
          </h2>
          <div
            class="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-6 break-words sm:grid-cols-2 lg:grid-cols-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-blue-100 [&_p]:mt-2"
          >
            ${translatorsMarkdown
              .split(/(?=^## )/m)
              .slice(1)
              .map((section) => {
                const localized = section.replace(
                  /^## (.+)$/m,
                  (_line, name: string) =>
                    `## ${nativeTranslatorLanguage(name.trim())}`,
                );
                return html`<div dir="auto">${renderMarkdown(localized)}</div>`;
              })}
          </div>
          <a
            class="mt-8 inline-block text-inherit hover:underline"
            href="https://crowdin.com/project/openfront-mls"
            target="_blank"
            rel="noopener noreferrer"
            >${translateText("credits.view_translation_project")}</a
          >
        </section>
        <section data-credits-section>
          <h2 class="mb-4 text-2xl sm:text-3xl font-semibold text-blue-200">
            ${translateText("credits.licenses")}
          </h2>
          <p class="mb-3">
            ${translateText("game_starting_modal.code_license")}
          </p>
          <div
            class="mx-auto max-w-6xl columns-1 gap-12 break-words text-center leading-relaxed md:columns-2 [&_a]:text-inherit [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-blue-200 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-blue-100 [&_p]:my-3 [&_ul]:list-inside [&_ul]:list-disc"
          >
            ${creditsMarkdown
              .replace(/^# Credits\s*\r?\n/, "")
              .split(/(?=^#{2,3} )/m)
              .filter((section) => section.trim())
              .map(
                (section) =>
                  html`<div class="break-inside-avoid">
                    ${renderMarkdown(section)}
                  </div>`,
              )}
          </div>
        </section>
        <div
          class="min-h-full flex items-center justify-center text-2xl sm:text-3xl font-bold"
        >
          <p data-credits-farewell>
            ${translateText("credits.thanks_for_playing")}
          </p>
        </div>
      </main>`,
    dialog,
  );
  document.body.append(dialog);
  dialog.showModal();
  if (!prefersReducedMotion()) {
    dialog.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: creditsPresentation.modalFadeMs,
      easing: "ease",
    });
  }
  const stopAnimation = animateCredits(
    dialog.querySelector("main")!,
    closeCredits,
  );
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCredits();
  });
  dialog.addEventListener(
    "close",
    () => {
      stopAnimation();
      dialog.remove();
    },
    { once: true },
  );
}
