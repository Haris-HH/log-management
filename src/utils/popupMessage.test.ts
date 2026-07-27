import { describe, it, expect, vi, beforeEach } from "vitest";

const fire = vi.fn();
vi.mock("sweetalert2", () => ({
  default: { fire: (...args: unknown[]) => fire(...args) },
}));

import { PopupMessage, PopupMessageWithCancel } from "./popupMessage";

beforeEach(() => {
  vi.clearAllMocks();
  fire.mockResolvedValue({ isConfirmed: true });
});

describe("PopupMessage", () => {
  it("passes title, text and icon through", async () => {
    await PopupMessage("popup.fetch-error", "details", "error");

    expect(fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "popup.fetch-error",
        text: "details",
        icon: "error",
        showConfirmButton: false,
        showCloseButton: true,
      })
    );
  });

  it("keeps the project popup class so styling is unchanged", async () => {
    await PopupMessage("t", "x", "info");
    expect(fire.mock.calls[0][0].customClass).toEqual({
      popup: "custom-swal-popup",
    });
  });

  it("resolves the confirmation result", async () => {
    await expect(PopupMessage("t", "x", "info")).resolves.toBe(true);

    fire.mockResolvedValue({ isConfirmed: false });
    await expect(PopupMessage("t", "x", "info")).resolves.toBe(false);
  });
});

describe("PopupMessageWithCancel", () => {
  it("wires up both buttons", async () => {
    await PopupMessageWithCancel(
      "popup.confirm-title",
      "popup.confirm-text",
      "button.ok",
      "button.cancel",
      "warning"
    );

    expect(fire).toHaveBeenCalledWith(
      expect.objectContaining({
        showCancelButton: true,
        confirmButtonText: "button.ok",
        cancelButtonText: "button.cancel",
        icon: "warning",
      })
    );
  });

  it("defaults iconColor to empty when not supplied", async () => {
    await PopupMessageWithCancel("t", "x", "ok", "cancel", "warning");
    expect(fire.mock.calls[0][0].iconColor).toBe("");
  });

  it("forwards a custom icon colour", async () => {
    await PopupMessageWithCancel(
      "t",
      "x",
      "ok",
      "cancel",
      "warning",
      "#DB2740"
    );
    expect(fire.mock.calls[0][0].iconColor).toBe("#DB2740");
  });

  it("resolves false when the user cancels", async () => {
    fire.mockResolvedValue({ isConfirmed: false, isDismissed: true });
    await expect(
      PopupMessageWithCancel("t", "x", "ok", "cancel", "warning")
    ).resolves.toBe(false);
  });
});
