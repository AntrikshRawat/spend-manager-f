import { create } from 'zustand'
import axiosInstance from '../functions/axiosInstance'
import { persist } from 'zustand/middleware';


const useUserStore = create(persist((set) => ({
  user:null,
  isLoggedIn:false,
  logOutDate:null,
  logOutUser: async () => {
    try{
      await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/v1/logout`,{},
        {
          withCredentials: true,
        }
      )
      set({isLoggedIn:false});
    }
    catch(error) {
      console.error('Error:', error)
    }
    finally{
      set({ user: null });
    }
  },

  setUser: (user) => set({ user }),

  fetchUserInfo: async () => {
    try {
      const { data } = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/auth/v1/userInfo`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )
      set({isLoggedIn:true});
      return data.user;
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  },
})))

export default useUserStore 