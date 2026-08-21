import { describe, it, expect } from "vitest";

import { PopupMessage, PopupMessageWithCancel } from "./popupMessage";
import {
  getActiveDialog,
  resolveActiveDialog,
} from "../components/confirmation-dialog/confirmationDialogStore";

describe("PopupMessage", () => {
  it("opens an alert dialog with title, text and icon", async () => {
    const pending = PopupMessage("popup.fetch-error", "details", "error");

    const active = getActiveDialog();
    expect(active?.config).toEqual(
      expect.objectContaining({
        kind: "alert",
        title: "popup.fetch-error",
        text: "details",
        icon: "error",
      })
    );

    resolveActiveDialog(true);
    await expect(pending).resolves.toBe(true);
  });

  it("resolves the confirmation result", async () => {
    const pending = PopupMessage("t", "x", "info");
    resolveActiveDialog(true);
    await expect(pending).resolves.toBe(true);

    const pending2 = PopupMessage("t", "x", "info");
    resolveActiveDialog(false);
    await expect(pending2).resolves.toBe(false);
  });
});

describe("PopupMessageWithCancel", () => {
  it("opens a confirm dialog with both buttons' labels", async () => {
    const pending = PopupMessageWithCancel(
      "popup.confirm-title",
      "popup.confirm-text",
      "button.ok",
      "button.cancel",
      "warning"
    );

    const active = getActiveDialog();
    expect(active?.config).toEqual(
      expect.objectContaining({
        kind: "confirm",
        confirmText: "button.ok",
        cancelText: "button.cancel",
        icon: "warning",
      })
    );

    resolveActiveDialog(true);
    await expect(pending).resolves.toBe(true);
  });

  it("leaves iconColor undefined when not supplied", async () => {
    const pending = PopupMessageWithCancel("t", "x", "ok", "cancel", "warning");
    const active = getActiveDialog();
    expect(active?.config.iconColor).toBeUndefined();

    resolveActiveDialog(true);
    await pending;
  });

  it("forwards a custom icon colour", async () => {
    const pending = PopupMessageWithCancel("t", "x", "ok", "cancel", "warning", "#DB2740");
    const active = getActiveDialog();
    expect(active?.config.iconColor).toBe("#DB2740");

    resolveActiveDialog(true);
    await pending;
  });

  it("resolves false when the user cancels", async () => {
    const pending = PopupMessageWithCancel("t", "x", "ok", "cancel", "warning");
    resolveActiveDialog(false);
    await expect(pending).resolves.toBe(false);
  });
});
