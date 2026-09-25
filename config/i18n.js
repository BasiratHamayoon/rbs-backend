const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: process.env.DEFAULT_LANGUAGE || 'en',
    preload: (process.env.SUPPORTED_LANGUAGES || 'en,ar').split(','),
    supportedLngs: (process.env.SUPPORTED_LANGUAGES || 'en,ar').split(','),
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/translation.json')
    },
    detection: {
      order: ['header', 'querystring', 'cookie'],
      lookupHeader: 'accept-language',
      lookupQuerystring: 'lang',
      lookupCookie: 'lang',
      caches: ['cookie']
    },
    interpolation: {
      escapeValue: false
    }
  });

module.exports = { i18next, middleware };