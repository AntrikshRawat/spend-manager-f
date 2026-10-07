import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../functions/axiosInstance";

const useAccountStore = create(
  persist(
    (set) => ({
      createdAccounts: null,
      joinedAccounts: null,
      monthlyLimits: {}, // format: { [accountId]: { [monthName]: limit, [monthKey]: limit } }

      setMonthlyLimit: (accountId, monthName, limit, monthKey) => {
        set((state) => ({
          monthlyLimits: {
            ...state.monthlyLimits,
            [accountId]: {
              ...(state.monthlyLimits?.[accountId] || {}),
              [monthName]: Number(limit),
              ...(monthKey ? { [monthKey]: Number(limit) } : {}),
            },
          },
        }));
      },

      getMonthlyLimit: (accountId, monthNameOrKey) => {
        const state = useAccountStore.getState();
        return state.monthlyLimits?.[accountId]?.[monthNameOrKey] ?? null;
      },

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
          set({ createdAccounts: null, joinedAccounts: null });
        }
      },

      clearAccounts: () => {
        set({ 
          createdAccounts: null,
          joinedAccounts: null
         });
      },
    }),
    { name: "account-storage" } // localStorage key
  )
);

export default useAccountStore;
