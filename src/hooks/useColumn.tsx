import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type ColumnOption = {
  key: string;
  label: string;
  checked: boolean;
};

export const useColumn = (): ColumnOption[] => {
  const { t, i18n } = useTranslation();

  return useMemo(
    () => [
      { key: "camera", label: t("table.header.camera-checkpoint"), checked: true },
      { key: "station", label: t("table.header.station"), checked: true },
      { key: "area", label: t("table.header.area"), checked: true },
      { key: "province", label: t("table.header.province"), checked: true },
      { key: "district", label: t("table.header.district"), checked: true },
      { key: "subdistrict", label: t("table.header.subdistrict"), checked: true },
      { key: "road", label: t("table.header.road"), checked: true },
      { key: "route", label: t("table.header.route"), checked: true },
      { key: "project", label: t("table.header.project"), checked: true },
    ],
    [t, i18n.language]
  );
};