// /src/stores/databaseStore.js
import { defineStore } from 'pinia'
import axiosClient from '../axios'

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    SC3_API_KEY: import.meta.env.VITE_API_KEY,
    
    users: [], //refactor
    barangays: [],//refactor
    reports: [],//refactor
    sources: [],//refactor
    actions: [],//refactor
    incidents: [],//refactor
    assistance: [],//refactor
    urgencies: [],//refactor
    recents: [],//goods
    logs: [],//refactor
    contacts: [],//refactor


    testReports: [], //goods, refactor
    audits: [], //goods, refactor
    emergencyContacts: [],


    usersList: [],
    incidentsList: [],
    assistanceList: [],
    actionsList: [],
    urgenciesList: [],
    sourcesList: [],
    barangaysList: [],
    reportsList: [],
    contactsList: [],


    //graphs and charts
    
  }),
  actions: {
    async Reports(searchParams = {}) {
      // Only include sort parameters if they have valid values
      const params = {
        search: searchParams.search || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        page: searchParams.page,
        per_page: searchParams.per_page || 10,
        sortSource: searchParams.sortSource,
        sortAssistance: searchParams.sortAssistance,
        sortIncident: searchParams.sortIncident,
        sortActions: searchParams.sortActions,
        sortUrgency: searchParams.sortUrgency,
        sortBarangay: searchParams.sortBarangay
      };
      
      try {
        const res = await axiosClient.get('/api/911/report-pagination', { 
          headers: { 'x-api-key': this.SC3_API_KEY }, 
          params: params 
        });
        this.testReports = res.data;
        return res.data;
      } catch (error) {
        console.error('Error fetching reports:', error);
        return error.response?.data?.message || 'Something went wrong';
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

    async Barangays(searchParams = {}) {
      const params = {
        search: searchParams.search || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        page: searchParams.page,
        per_page: searchParams.per_page || 10,
      };

      try {
        const res = await axiosClient.get('/api/911/barangay', { headers: { 'x-api-key': this.SC3_API_KEY }, params: params });
        this.barangays = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },

    async Users(searchParams = {}) {
      const params = {
        search: searchParams.search || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || '',
        page: searchParams.page,
        per_page: searchParams.per_page || 10,
      };

      try {
        const res = await axiosClient.get('/api/911/users', { headers: { 'x-api-key': this.SC3_API_KEY }, params: params });
        this.usersList = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },

    async Incidents() {
      try {
        const res = await axiosClient.get('/api/911/incident', { headers: { 'x-api-key': this.SC3_API_KEY } });
        this.incidentsList = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },

    async Assistances() {
      try {
        const res = await axiosClient.get('/api/911/assistance', { headers: { 'x-api-key': this.SC3_API_KEY } });
        this.assistanceList = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },

    async Actions() {
      try {
        const res = await axiosClient.get('/api/911/action-taken', { headers: { 'x-api-key': this.SC3_API_KEY } });
        this.actionsList = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },

    async Urgencies() {
      try {
        const res = await axiosClient.get('/api/911/urgency', { headers: { 'x-api-key': this.SC3_API_KEY } });
        this.urgenciesList = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },

    async Sources() {
      try {
        const res = await axiosClient.get('/api/911/source', { headers: { 'x-api-key': this.SC3_API_KEY } });
        this.sourcesList = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },

    async Contacts() {
      try {
        const res = await axiosClient.get('/api/911/emergency-contacts', { headers: { 'x-api-key': this.SC3_API_KEY } });
        this.contactsList = res.data;
      } catch (error) {
        return error.response.data.message || 'Something went wrong';
      }
    },


    ///here lies he charts and graphs fetch data api's

    

    

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