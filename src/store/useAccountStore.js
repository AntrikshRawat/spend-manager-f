import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../functions/axiosInstance";

const useAccountStore = create(
  persist(
    (set) => ({
      createdAccounts: [],
      joinedAccounts: [],

      fetchAndUpdateAccounts: async () => {
        try {
          const { data } = await axiosInstance.get(
            `${import.meta.env.VITE_BACKEND_URL}/account/getaccounts`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          const { created = [], joined = [] } = data;
          set({ createdAccounts: created, joinedAccounts: joined });
        } catch (error) {
          console.error("Error fetching accounts:", error);
          set({ createdAccounts: [], joinedAccounts: [] });
        }
      },

      clearAccounts: () => {
        set({ createdAccounts: [], joinedAccounts: [] });
      },
    }),
    { name: "account-storage" } // localStorage key
  )
);

export default useAccountStore;
