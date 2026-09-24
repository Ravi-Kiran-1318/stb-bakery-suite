import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const I18nContext = createContext();

// Helper to resolve nested keys like "Navigation.Home"
function resolve(obj, path) {
  return path.split(".").reduce((cur, k) => (cur && cur[k] !== undefined ? cur[k] : null), obj);
}

// Helper to interpolate strings like "Only {count} validators"
function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
}

const LOADERS = {
  en: () => import('../locales/en.js'),
  te: () => import('../locales/te.js'),
};
// and also buddy is every translation completed 

// eslint-disable-next-line react/prop-types
export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('app_lang') || 'en');
  const [strings, setStrings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadTranslations = async () => {
      try {
        const module = await (LOADERS[language] ? LOADERS[language]() : LOADERS['en']());
        if (isMounted) {
          setStrings(module.default);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Failed to load translations for ${language}`, err);
        if (isMounted) setLoading(false);
      }
    };

    loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = useCallback((key, params = null, defaultText = null) => {
    if (loading && Object.keys(strings).length === 0) {
      return defaultText || key.split('.').pop();
    }
    const val = resolve(strings, key);
    if (val == null) {
      console.warn(`Missing translation key: ${key}`);
      return defaultText || key.split('.').pop();
    }
    return interpolate(val, params);
  }, [strings, loading]);

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t, loading }}>
      {children}
    </I18nContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
