import axios from 'axios';
import useUserStore from '../store/useUserStore';

const axiosInstance = axios.create();

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      // Logout user if 401 Unauthorized
      const { logOutUser } = useUserStore.getState();
      await logOutUser();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 