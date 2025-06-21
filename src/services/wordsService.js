import api from './index';

/**
 * Submit words to the backend.
 * @param {{ source: string, url?: string, files?: File[] }} params
 * @returns {Promise<any>} response data
 */
export const submitWords = async ({ source, url, files }) => {
  const formData = new FormData();
//   formData.append('source', source);
//   if (url) {
//     formData.append('url', url);
//   }
//   if (files && files.length > 0) {
//     files.forEach((file) => {
//       formData.append('files', file);
//     });
//   }
  formData.append('youtube_url', url);

  const response = await api.post(
    '/import/youtube', 
    { youtube_url: url }
  );
  console.log('submitWords response:', response);
  return response.data;
};
