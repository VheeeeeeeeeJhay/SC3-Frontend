// /src/stores/databaseStore.js
import { defineStore } from 'pinia'
import axiosClient from '../axios'

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    SC3_API_KEY: import.meta.env.VITE_API_KEY,
    

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


    testReports: [],
    audits: [],
    emergencyContacts: [],

    data1: [],
    data2: [],
  }),
  actions: {
    async Reports(searchParams = {}) {
      const params = {
        search: searchParams.search || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        page: searchParams.page,
        per_page: searchParams.per_page || 10,
      };
      
      try {
        const res = await axiosClient.get('/api/911/report-pagination', { headers: { 'x-api-key': this.SC3_API_KEY }, params: params });
        this.testReports = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },

    async Audits(searchParams = {}) {
      const params = {
        search: searchParams.search || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        page: searchParams.page,
        per_page: searchParams.per_page || 10,
      };

      try {
        const res = await axiosClient.get('/api/911/audit-pagination', { headers: { 'x-api-key': this.SC3_API_KEY }, params: params });
        this.audits = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },


    async fetcherData() {
      await Promise.all([this.Reports({page: 1, per_page: 10}), this.Audits({page: 1, per_page: 10})])
      .then((response) => {
        this.data1 = response[0].data;
        this.data2 = response[1].data;
        console.log(response, this.data1, this.data2)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      });
    },

    async fetchData() {
      const API_KEY = this.SC3_API_KEY
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
          resAudit,
          resContacts
        ] = await Promise.all([
          axiosClient.get('/api/911/users', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/barangay', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/report', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/source', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/action-taken', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/incident', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/assistance', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/urgency', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/recent', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/audit', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            return { data: [] }; 
          }),

          axiosClient.get('/api/911/emergency-contacts', { 
            headers: { 'x-api-key': API_KEY } 
          })
          .catch(error => {
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
        
        this.logs = resAudit.data || [];
        
        this.contacts = resContacts.data || [];
      } catch (error) {
        return error.response.data.message || 'Something went wrong fetching data';
      }
    },
  },
})