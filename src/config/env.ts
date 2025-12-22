const getEnv = (key: string, required: boolean = false): string => {
    const value = import.meta.env[key];
    if (required && !value) {
        console.warn(`Missing environment variable: ${key}`); // Warn instead of throw to avoid crashing if partially configured in dev
    }
    return value || '';
};

export const ENV = {
    STRAPI_BASE_URL: getEnv('VITE_STRAPI_BASE_URL', true),
    STRAPI_URL: getEnv('VITE_STRAPI_URL', true),
    QR_BASE_URL: getEnv('VITE_QR_BASE_URL', true),
    APP_VERSION: getEnv('VITE_APP_VERSION') || '1.0.0',
    GOOGLE_MAPS_API_KEY: getEnv('VITE_GOOGLE_MAPS_API_KEY'),
};
