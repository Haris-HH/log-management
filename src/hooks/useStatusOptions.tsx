// i18n
import { useTranslation } from "react-i18next";

export type StatusOptions = {
  id: number;
  key: string;
  name: string;
  color: string;
};

export const useStatusOptions = () :StatusOptions[] => {
  const { t } = useTranslation();

  return [
    { id: 1, key: "offline", name: t('status.disable'), color: "var(--status-device-disable)"},
    { id: 2, key: "suspended", name: t('status.suspend'), color: "var(--status-device-suspended)"},
    { id: 3, key: "others", name: t('status.network-outage'), color: "var(--status-network-outage)"},
    { id: 4, key: "maintenance", name: t('status.device-outage'), color: "var(--status-device-outage)"},
    { id: 5, key: "online", name: t('status.normal-status'), color: "var(--status-device-normal)"},
  ]
};