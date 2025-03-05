// i18next-parser.config.js
module.exports = {
    locales: ['en', 'fr'],  // Define your supported languages here
    output: './public/locales/$LOCALE/$NAMESPACE.json',  // Define output path for the translation files
    defaultNamespace: 'common',  // Default namespace if not specified
    createOldCatalogs: false,    // Set to false to not save old translations
    keepRemoved: false,          // Remove translations that are not in use anymore
    lexers: {
      js: ['JsxLexer'],          // Parses JSX and JS files for translation keys
    },
    // Specify other settings as needed
  };
  