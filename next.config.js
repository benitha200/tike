// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     i18n: {
//       locales: ["en", "fr"],
//       defaultLocale: "fr",    
//     },
//   };
  
//   module.exports = nextConfig;
  

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    // Locales you want to support
    locales: ['en', 'fr'],
    // Default locale
    defaultLocale: 'en',
    // Automatically detect the user's locale
    localeDetection: true,
  },
};

module.exports = nextConfig;