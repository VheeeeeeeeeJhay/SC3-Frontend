// /src/stores/databaseStore.js
import { defineStore } from 'pinia'
import axiosClient from '../axios'

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    activeUsers: [], // container for fetched users
    archivedUsers: [],
    barangaysList: [],
    reportsPerBarangay: [],
    reportsList: [],
    classificationsList: [],
    urgenciesList: [],
    actionsList: [],
    sources: [],
    actions: [],
    incidents: [],
    assistance: [],
    urgencies: [],
    barangays: [],
    dashboard: [],
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
          resReportDatas,
          resDashboard
        ] = await Promise.all([
          axiosClient.get('/api/911/users', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching active users:', error);
            return { data: [] }; // Default empty data in case of error
          }),
          axiosClient.get('/api/911/users', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching archived users:', error);
            return { data: [] }; // Default empty data in case of error
          }),
          axiosClient.get('/api/911/barangay', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching barangays:', error);
            return { data: { barangays: [], reportsPerBarangay: [] } }; // Default empty data in case of error
          }),
          axiosClient.get('/api/911/report-display', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching report-display:', error);
            return { data: [] }; // Default empty data in case of error
          }),
          axiosClient.get('/api/911/report', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching report data:', error);
            return { data: { sources: [], actions: [], incidents: [], assistance: [], urgencies: [], barangays: [] } }; // Default empty data in case of error
          }),
          axiosClient.get('/api/911/dashboard', { headers: { 'x-api-key': API_KEY } }).catch(error => {
            console.error('Error fetching dashboard data:', error);
            return { data: [] }; // Default empty data in case of error
          })
        ]);

        // axiosClient.get('/api/911/users', { headers: { 'x-api-key': API_KEY } }),
        this.activeUsers = resActiveUsers.data.filter(user => 
            (user.for_911 === 1 && user.for_inventory === 1) || 
            (user.for_911 === 1 && user.for_inventory === 0) || 
            (user.for_911 === 0 && user.for_inventory === 1)
        );

        // axiosClient.get('/api/911/users', { headers: { 'x-api-key': API_KEY } }),
        this.archivedUsers = resArchivedUsers.data.filter(user => 
            (user.for_911 === 0 && user.for_inventory === 0)
        );

        // axiosClient.get('/api/911/barangay', { headers: { 'x-api-key': API_KEY } }),
        this.barangaysList = resBarangays.data.barangays;
        // console.log(this.barangaysList, 'barangays');
        this.reportsPerBarangay = resBarangays.data.reportsPerBarangay;
        // console.log(this.reportsPerBarangay, 'count per barangay');
        // console.log(resBarangays.data)

        // axiosClient.get('/api/911/report-display', { headers: { 'x-api-key': API_KEY } }),
        this.reportsList = resReports.data[0] || [];
        this.classificationsList = resReports.data[1] || [];
        this.urgenciesList = resReports.data[2] || [];
        this.actionsList = resReports.data[3] || [];

        // axiosClient.get('/api/911/report', { headers: { 'x-api-key': API_KEY } }),
        this.sources = resReportDatas.data.sources || [];
        this.actions = resReportDatas.data.actions || [];
        this.incidents = resReportDatas.data.incidents || [];
        this.assistance = resReportDatas.data.assistance || [];
        this.urgencies = resReportDatas.data.urgencies || [];
        this.barangays = resReportDatas.data.barangays || [];

      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
  },
})