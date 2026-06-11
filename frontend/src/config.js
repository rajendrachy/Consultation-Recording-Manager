export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Derived backend base URL for assets (removing '/api' suffix)
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const formattedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${formattedUrl}`;
  }
  return url;
};
