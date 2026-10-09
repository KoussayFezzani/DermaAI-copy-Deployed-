// Centralized API configuration supporting environment overrides
export const API_BASE_URL = (
    import.meta.env.VITE_API_URL !== undefined 
        ? import.meta.env.VITE_API_URL 
        : (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:5000')
).replace(/\/$/, '');

export const API_ENDPOINTS = {
    HEALTH: `${API_BASE_URL}/api/health`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    UPLOAD_DIAGNOSIS: `${API_BASE_URL}/api/upload-diagnosis`,
    CHAT_STREAM: `${API_BASE_URL}/api/chat-query-stream`,
    HISTORY: `${API_BASE_URL}/api/history`,
    DISEASES: `${API_BASE_URL}/api/diseases`,
    STATS_GLOBAL: `${API_BASE_URL}/api/stats/global`,
    ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
    NEWS: `${API_BASE_URL}/api/news`,
    USER: `${API_BASE_URL}/api/user`,
};
