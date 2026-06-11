const getRawApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  
  // Clean up any trailing slashes
  const cleanedUrl = envUrl.replace(/\/+$/, '');
  
  // Resiliently append /api if the user forgot it in their Vercel config
  return cleanedUrl.endsWith('/api') ? cleanedUrl : `${cleanedUrl}/api`;
};

export const API_BASE_URL = getRawApiUrl();

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
