import {defineStore} from "pinia";
import axiosClient from "../axios.js";

const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  actions: {
    fetchUser() {
      return axiosClient.get('/api/user', {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      })
      .then(({data}) => {
        // console.log(data)
        this.user = data

        if (!this.user.for_911) {
          router.push({ name: 'Login', query: { message: 'Access denied: This feature is only available for 911 personnel.' } });
          // return;
        }
      })
    }
  }
})

export default useUserStore;