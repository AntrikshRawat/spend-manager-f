import axios from 'axios';
import useUserStore from '../store/useUserStore';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    const { authToken } = useUserStore.getState();
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url;

      // 🛑 Skip logout for login/register endpoints
      if (requestUrl.includes('/login') || requestUrl.includes('/register')) {
        return Promise.reject(error);
      }

      // ✅ For other requests, log out the user
      const { logOutUser } = useUserStore.getState();
      await logOutUser();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
