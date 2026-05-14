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
    { id: 1, key: "disable", name: t('status.disable'), color: "var(--status-device-disable)"},
    { id: 2, key: "network", name: t('status.network-outage'), color: "var(--status-network-outage)"},
    { id: 3, key: "device", name: t('status.device-outage'), color: "var(--status-device-outage)"},
    { id: 4, key: "normal", name: t('status.normal-status'), color: "var(--status-device-normal)"},
  ]
};