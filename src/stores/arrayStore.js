// // stores/dataStore.js
// import { defineStore } from 'pinia';

// export const useArrayStore = defineStore('arrayStore', {
//   state: () => ({
//     dataArray: {},  // Array to store your data
//   }),
//   actions: {
//     // Method to set the array to the store
//     setData(data) {
//       this.dataArray = data;
//     },
//     // Method to get the stored array
//     getData() {
//       return this.dataArray;
//     },
//     // Optionally clear the data if needed
//     // clearData() {
//     //   this.dataArray = {};
//     // }
//   },
// });


// stores/dataStore.js
import { defineStore } from 'pinia';

export const useArrayStore = defineStore('arrayStore', {
  state: () => ({
    dataArray: JSON.parse(localStorage.getItem('dataArray')) || {}, // Retrieve stored data
  }),
  actions: {
    setData(data) {
      this.dataArray = data;
      localStorage.setItem('dataArray', JSON.stringify(data)); // Save to localStorage
    },
    getData() {
      return this.dataArray;
    },
    clearData() {
      this.dataArray = {};
      localStorage.removeItem('dataArray'); // Clear from localStorage
    },
  },
});
