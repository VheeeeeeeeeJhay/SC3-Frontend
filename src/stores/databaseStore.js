// /src/stores/databaseStore.js
import { defineStore } from 'pinia'
import axiosClient from '../axios'

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    activeUsers: [], // container for fetched users
    archivedUsers: [],
    barangaysList: [],
    reportsList: [],
    classificationsList: [],
  }),
  actions: {
    async fetchData() {
      const API_KEY = import.meta.env.VITE_API_KEY
      try {
        // Execute all requests concurrently
        const [
          resActiveUsers,
          resArchivedUsers,
          resBarangays,
          resReports,
        ] = await Promise.all([
          axiosClient.get('/api/911/users', { headers: { 'x-api-key': API_KEY } }),
          axiosClient.get('/api/911/users', { headers: { 'x-api-key': API_KEY } }),
          axiosClient.get('/api/911/barangay', { headers: { 'x-api-key': API_KEY } }),
          axiosClient.get('/api/911/report-display', { headers: { 'x-api-key': API_KEY } }),

        ])

        this.activeUsers = resActiveUsers.data.filter(user => 
            (user.for_911 === 1 && user.for_inventory === 1) || 
            (user.for_911 === 1 && user.for_inventory === 0) || 
            (user.for_911 === 0 && user.for_inventory === 1)
        );

        this.archivedUsers = resArchivedUsers.data.filter(user => 
            (user.for_911 === 0 && user.for_inventory === 0)
        );

        this.barangaysList = resBarangays.data;

        this.reportsList = resReports.data[0];
        this.classificationsList = resReports.data[1];
        console.log(this.reportsList, 'reports');
        console.log(this.classificationsList, 'classifications');

        // this.equipmentCopies = resEquipmentCopies.data
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
  },
})