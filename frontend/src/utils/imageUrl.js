// Helper function to construct full image URLs
export const getImageUrl = (photoUrl) => {
  if (!photoUrl) return null;
  
  // If it's already a full URL, return as is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  
  // Otherwise prepend the backend server URL
  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  const baseUrl = backendUrl.replace('/api', ''); // Remove /api from the base URL
  return `${baseUrl}${photoUrl}`;
};
