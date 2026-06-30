import { useEffect } from "react";

// i18n
import { useTranslation } from "react-i18next";

const usePageTitle = (title: string) => {
  // i18n
  const { t } = useTranslation();

  useEffect(() => {
    document.title = title ? `${title} | ${t('project.title')}` : t('project.title');
  }, [title]);
};

export default usePageTitle;