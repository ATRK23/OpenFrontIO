import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseModal } from "./components/BaseModal";

/**
 * Full-screen shell for the credits sequence. Content and presentation land
 * in later, focused changes; keeping routing and viewport ownership here
 * makes those changes independent from the generic modal primitive.
 */
@customElement("credits-modal")
export class CreditsModal extends BaseModal {
  protected routerName = "credits";

  protected modalConfig() {
    return { fullScreen: true, hideHeader: true };
  }

  protected renderBody() {
    return html``;
  }
}
