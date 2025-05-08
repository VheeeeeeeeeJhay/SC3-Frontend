// /src/stores/databaseStore.js
import { defineStore } from 'pinia'
import axiosClient from '../axios'

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    users: [],
    barangays: [],
    reports: [],
    sources: [],
    actions: [],
    incidents: [],
    assistance: [],
    urgencies: [],
    recents: [],
    logs: [],
    contacts: [],
  }),
  actions: {
    async fetchData() {
      const API_KEY = import.meta.env.VITE_API_KEY
      try {
        // Execute all requests concurrently
        const [
          resUsers,
          resBarangays,
          resReports,
          resSources,
          resActions,
          resIncidents,
          resAssistance,
          resUrgencies,
          resRecents,
          resLogs,
          resContacts
        ] = await Promise.all([
          axiosClient.get('/api/911/users', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching active users:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/barangay', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching barangays:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/report', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching report:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/source', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching sources:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/action_taken', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching actions:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/incident', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching incidents:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/assistance', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching assistance:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/urgency', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching urgencies:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/recent', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching recent data:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/tracking', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching recent data:', error);
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/emergency-contacts', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching recent data:', error);
            return { data: [] }; 
          })
        ]);
        
        this.users = resUsers.data || [];
        
        this.barangays = resBarangays.data || [];
       
        this.reports = resReports.data || [];
        
        this.sources = resSources.data || [];

        this.actions = resActions.data || [];
        
        this.incidents = resIncidents.data || [];
        
        this.assistance = resAssistance.data || [];
        
        this.urgencies = resUrgencies.data || [];
        
        this.recents = resRecents.data.recents || [];
        
        this.logs = resLogs.data || [];
        
        this.contacts = resContacts.data || [];
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
  },
})