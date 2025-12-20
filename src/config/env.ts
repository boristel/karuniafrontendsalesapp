export const ENV = {
    STRAPI_BASE_URL: import.meta.env.VITE_STRAPI_BASE_URL || 'http://localhost:1337/api',
    STRAPI_URL: import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337',
    QR_BASE_URL: import.meta.env.VITE_QR_BASE_URL || 'https://karunia.com/profile/',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.1',
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
};
