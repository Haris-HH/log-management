import { openAlert, openConfirm, type PopupIcon } from "../components/confirmation-dialog/confirmationDialogStore";

export function PopupMessage(title: string, text: string, icon: PopupIcon): Promise<boolean> {
  return openAlert({ title, text, icon });
}

export function PopupMessageWithCancel(
  title: string,
  text: string,
  confirmButtonText: string,
  cancelButtonText: string,
  icon: PopupIcon,
  iconColor?: string
): Promise<boolean> {
  return openConfirm({
    title,
    text,
    icon,
    iconColor,
    confirmText: confirmButtonText,
    cancelText: cancelButtonText,
  });
}
