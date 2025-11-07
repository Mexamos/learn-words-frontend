import api from './index';

/**
 * Update current user's profile.
 * @param {{ native_language?: string }} data
 * @returns {Promise<{ id: number, email: string, name: string, picture: string, native_language: string }>}
 */
export const updateUserProfile = async (data) => {
  const response = await api.patch('/me', data);
  return response.data;
};

