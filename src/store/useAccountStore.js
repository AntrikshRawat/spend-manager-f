import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../functions/axiosInstance";

const useAccountStore = create(
  persist((set) => ({
    createdAccounts: null,
    joinedAccounts: null,
    fetchAndUpdateAccounts: async () => {
      const { data } = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/account/getaccounts`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const { created = [], joined = [] } = data;
      set({
        createdAccounts: created,
        joinedAccounts: joined,
      });
    },
    clearAccounts:()=>{
      set({
        createdAccounts:null,
        joinedAccounts:null
      })
    }
  }))
);

export default useAccountStore;
