import { useEffect } from "react";

// i18n
import { useTranslation } from "react-i18next";

const usePageTitle = (title: string) => {
  // i18n
  const { t } = useTranslation();

  useEffect(() => {
    // `t` must stay in the deps: the XHR backend resolves after first paint, so
    // the first call returns the raw key. i18next then hands back a new `t` —
    // without it here the title stays frozen at "project.title" in a build,
    // where the locale fetch is a real round trip rather than a dev-server hit.
    document.title = title ? `${title} | ${t('project.title')}` : t('project.title');
  }, [title, t]);
};

export default usePageTitle;