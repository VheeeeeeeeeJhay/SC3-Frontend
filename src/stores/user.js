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
      }
    },

    // Update the user profile data
    async updateUser(updatedData) {
      try {
        const { data } = await axiosClient.put(`/api/user/${this.user.id}`, updatedData, {
          headers: {
            "x-api-key": import.meta.env.VITE_API_KEY
          }
        });
        this.user = data.data; // <- Update to `data.data` because that's how you're wrapping the response in the controller
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;

        if (!this.user.for_911) {
          router.push({ name: 'Login', query: { message: 'Access denied: This feature is only available for 911 personnel.' } });
          // return;
        }
      }
    }    
  }
});

export default useUserStore;
