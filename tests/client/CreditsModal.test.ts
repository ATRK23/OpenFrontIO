// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { CreditsModal } from "../../src/client/CreditsModal";

describe("credits-modal", () => {
  let modal: CreditsModal | undefined;

  afterEach(() => modal?.remove());

  it("orders the team, contributors, and legal credits", async () => {
    if (!customElements.get("credits-modal")) {
      customElements.define("credits-modal", CreditsModal);
    }
    modal = document.createElement("credits-modal") as CreditsModal;
    document.body.append(modal);
    await modal.updateComplete;

    expect((modal as any).modalConfig().fullScreen).toBe(true);
    const team = modal.querySelector('[data-credits-section="team"]');
    const contributors = modal.querySelector(
      '[data-credits-section="contributors"]',
    );
    const legal = modal.querySelector('[data-credits-section="legal"]');

    expect(team?.textContent).toContain("Evan Pelle");
    expect(legal?.textContent).toContain("OpenStreetMap");
    expect(modal.querySelector("[data-credits-opening]")).not.toBeNull();
    expect(modal.querySelector("[data-credits-closing]")).not.toBeNull();
    expect(
      team!.compareDocumentPosition(contributors!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      contributors!.compareDocumentPosition(legal!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });
});
