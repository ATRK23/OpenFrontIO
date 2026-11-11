import { html, render } from "lit";
import creditsMarkdown from "../../../CREDITS.md?raw";
import { renderMarkdown } from "../Markdown";
import { prefersReducedMotion } from "../utilities/ReducedMotion";
import { translateText } from "../Utils";
import { animateCredits } from "./CreditsAnimation";
import { featuredPeople } from "./people";
import { creditsPresentation } from "./presentation";

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
        <button
          type="button"
          class="rounded px-4 py-2 bg-white/10 hover:bg-white/20"
          @click=${closeCredits}
        >
          ${translateText("common.close")}
        </button>
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
          <h2 class="mb-6 text-2xl sm:text-3xl font-semibold">
            ${translateText("credits.team")}
          </h2>
          ${featuredPeople.map(
            (person) =>
              html`<p class="mb-4">
                ${
                  person.url
                    ? html`<a
                        class="text-blue-300 hover:underline"
                        href=${person.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        >${person.name}</a
                      >`
                    : person.name
                }
                <span class="block text-white/60"
                  >${translateText(person.roleKey)}</span
                >
              </p>`,
          )}
          ${featuredPeople.length === 0 ? html`<p class="text-white/60">${translateText("credits.team_pending")}</p>` : null}
        </section>
        <section data-credits-section class="mb-12">
          <h2 class="mb-4 text-2xl sm:text-3xl font-semibold">
            ${translateText("credits.contributors")}
          </h2>
          <a
            class="text-blue-300 hover:underline"
            href="https://github.com/openfrontio/OpenFrontIO/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            >${translateText("credits.view_contributors")}</a
          >
        </section>
        <section data-credits-section>
          <h2 class="mb-4 text-2xl sm:text-3xl font-semibold">
            ${translateText("credits.licenses")}
          </h2>
          <p class="mb-3">
            ${translateText("game_starting_modal.code_license")}
          </p>
          <div
            class="mx-auto max-w-3xl text-left leading-relaxed [&_a]:text-blue-300 [&_a]:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
          >
            ${renderMarkdown(creditsMarkdown.replace(/^# Credits\s*\r?\n/, ""))}
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
