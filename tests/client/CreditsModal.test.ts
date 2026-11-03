// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { CreditsModal } from "../../src/client/CreditsModal";

describe("credits-modal", () => {
  let modal: CreditsModal | undefined;

  afterEach(() => modal?.remove());

  it("uses the full-screen modal surface", () => {
    if (!customElements.get("credits-modal")) {
      customElements.define("credits-modal", CreditsModal);
    }
    modal = document.createElement("credits-modal") as CreditsModal;

    expect((modal as any).modalConfig().fullScreen).toBe(true);
  });
});
