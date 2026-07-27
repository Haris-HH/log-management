import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'th',
    // Verbose i18next logging is a dev aid; leaving it on in a production build
    // spams the console and advertises the app's internals.
    debug: import.meta.env.DEV,
    ns: ['trans'],
    defaultNS: 'trans',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;