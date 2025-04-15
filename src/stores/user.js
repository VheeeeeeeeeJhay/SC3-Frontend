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
        
        // Check if user is allowed to login (for_911 must be true)
        if (!data.for_911) {
          // Clear any existing user data
          this.user = null;
          // Redirect to login page
          this.$router.push('/login');
          throw new Error('Access denied: User is not authorized for 911 system');
        }
        
        this.user = data; // Store the fetched user data in the state
      } catch (error) {
        console.error("Error fetching user:", error);
        // Optionally, handle the error here (e.g., show an error message in the UI)
        this.user = null; // Clear user data on error
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
      }
    }    
  }
});

export default useUserStore;
