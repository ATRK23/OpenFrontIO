import { html, render } from "lit";
import creditsMarkdown from "../../../CREDITS.md?raw";
import { renderMarkdown } from "../Markdown";
import { translateText } from "../Utils";
import { featuredPeople } from "./people";

/** Opens the credits over the homepage without loading them on startup. */
export function openCredits(): void {
  if (document.querySelector("#credits-dialog")) return;

  const dialog = document.createElement("dialog");
  dialog.id = "credits-dialog";
  dialog.className =
    "fixed inset-0 m-0 w-full h-full max-w-none max-h-none bg-zinc-950 text-white p-0";
  dialog.setAttribute("aria-labelledby", "credits-title");
  render(
    html`<header
        class="flex items-center justify-between gap-4 p-6 border-b border-white/10"
      >
        <h1 id="credits-title" class="text-2xl font-bold">
          ${translateText("game_starting_modal.credits")}
        </h1>
        <button
          type="button"
          class="rounded px-4 py-2 bg-white/10 hover:bg-white/20"
          @click=${() => dialog.close()}
        >
          ${translateText("common.close")}
        </button>
      </header>
      <main class="h-[calc(100%-6rem)] overflow-y-auto px-6 py-12 text-center">
        ${
          featuredPeople.length
            ? html`<section class="mb-12">
                <h2 class="mb-6 text-xl font-semibold">
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
              </section>`
            : null
        }
        <section class="mb-12">
          <h2 class="mb-4 text-xl font-semibold">
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
        <section>
          <h2 class="mb-4 text-xl font-semibold">
            ${translateText("credits.licenses")}
          </h2>
          <p class="mb-3">
            ${translateText("game_starting_modal.code_license")}
          </p>
          <div
            class="mx-auto max-w-3xl text-left leading-relaxed [&_a]:text-blue-300 [&_a]:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
          >
            ${renderMarkdown(creditsMarkdown)}
          </div>
        </section>
      </main>`,
    dialog,
  );
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  document.body.append(dialog);
  dialog.showModal();
}
