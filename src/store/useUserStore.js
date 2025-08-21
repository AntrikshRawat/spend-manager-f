import { create } from "zustand";
import axiosInstance from "../functions/axiosInstance";
import { persist } from "zustand/middleware";
import useAccountStore from "./useAccountStore";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      logOutDate: null,
      authToken:null,
      setToken:async(token)=>{
        set({authToken:token});
      },
      logOutUser: async () => {
        try {
          await axiosInstance.post(
            `${import.meta.env.VITE_BACKEND_URL}/auth/v1/logout`,
            {},
            { withCredentials: true }
          );
          useAccountStore.getState().clearAccounts();
        } catch (error) {
          console.error("Error logging out:", error);
        } finally {
          set({
            user: null,
            isLoggedIn: false,
          });
        }
      },

      fetchUserInfo: async () => {
        try {
          const { data } = await axiosInstance.get(
            `${import.meta.env.VITE_BACKEND_URL}/auth/v1/userInfo`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          set({ isLoggedIn: true, user: data.user });
        } catch (error) {
          console.error("Error fetching user info:", error);
          set({ user: null, isLoggedIn: false });
        }
      },
    }),
    { name: "user-storage" }
  )
);

export default useUserStore;
