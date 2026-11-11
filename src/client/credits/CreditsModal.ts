import { html, render } from "lit";
import { translateText } from "../Utils";

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
    </header>`,
    dialog,
  );
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  document.body.append(dialog);
  dialog.showModal();
}
