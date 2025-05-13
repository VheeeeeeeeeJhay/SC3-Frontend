import { defineStore } from "pinia";
import axiosClient from "../axios.js";

const useUserStore = defineStore("user", {
  state: () => ({
    user: null
  }),

  actions: {
    // Fetch the user data
    async fetchUser() {
      try {
        const { data } = await axiosClient.get("/api/user", {
          headers: {
            "x-api-key": import.meta.env.VITE_API_KEY
          }
        });
        
        this.user = data; // Store the fetched user data in the state
      } catch (error) {
        console.error("Error fetching user:", error);
        // Optionally, handle the error here (e.g., show an error message in the UI)
        this.user = null; // Clear user data on error
      }
    },  
  }
});

export default useUserStore;
