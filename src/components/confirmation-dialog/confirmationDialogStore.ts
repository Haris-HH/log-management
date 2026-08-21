// Imperative, promise-based confirmation dialog store.
//
// Mirrors the old SweetAlert2 helpers' calling convention (`await open...()`
// resolves once the user acts) so `src/utils/popupMessage.tsx` can wrap it
// without touching any call site. Only one dialog is shown at a time; if a
// second call comes in while one is open (shouldn't happen given every call
// site awaits its popup) it queues and opens once the current one resolves.

export type PopupIcon = "success" | "error" | "warning" | "info" | "question";

interface AlertConfig {
  kind: "alert";
  title: string;
  text: string;
  icon: PopupIcon;
  iconColor?: string;
}

interface ConfirmConfig {
  kind: "confirm";
  title: string;
  text: string;
  icon: PopupIcon;
  iconColor?: string;
  confirmText: string;
  cancelText: string;
}

export type DialogConfig = AlertConfig | ConfirmConfig;

interface ActiveDialog {
  id: number;
  config: DialogConfig;
  resolve: (result: boolean) => void;
}

let nextId = 0;
let current: ActiveDialog | null = null;
const queue: ActiveDialog[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function push(config: DialogConfig, resolve: (result: boolean) => void) {
  const entry: ActiveDialog = { id: nextId++, config, resolve };

  if (current) {
    queue.push(entry);
  } else {
    current = entry;
    emit();
  }
}

/** Called by the dialog view once the user has picked an action. */
export function resolveActiveDialog(result: boolean) {
  if (!current) return;

  current.resolve(result);
  current = queue.shift() ?? null;
  emit();
}

export function subscribeConfirmationDialog(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActiveDialog() {
  return current;
}

export function openAlert(config: Omit<AlertConfig, "kind">): Promise<boolean> {
  return new Promise((resolve) => {
    push({ kind: "alert", ...config }, resolve);
  });
}

export function openConfirm(config: Omit<ConfirmConfig, "kind">): Promise<boolean> {
  return new Promise((resolve) => {
    push({ kind: "confirm", ...config }, resolve);
  });
}
