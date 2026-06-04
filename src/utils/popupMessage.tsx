import Swal from 'sweetalert2';
import type { SweetAlertIcon } from 'sweetalert2';

export function PopupMessage(title: string, text: string, icon: SweetAlertIcon): Promise<boolean> {
  return (
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: "custom-swal-popup",
      },
    }).then((result) => {
      return result.isConfirmed
    })
  )
}

export function PopupMessageWithCancel(
  title: string, 
  text: string, 
  confirmButtonText: string, 
  cancelButtonText: string, 
  icon: SweetAlertIcon,
  iconColor?: string): 
Promise<boolean> {
  return (
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      showCloseButton: true,
      iconColor: iconColor ? iconColor : "",
      customClass: {
        popup: "custom-swal-popup",
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
      },
    }).then((result) => {
      return result.isConfirmed
    })
  )
}