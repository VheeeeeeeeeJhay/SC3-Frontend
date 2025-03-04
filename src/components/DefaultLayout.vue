<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRoute } from 'vue-router';
import useUserStore from "../stores/user.js";
import axiosClient from "../axios.js";
import router from "../router.js";
import { useThemeStore } from '../stores/themeStore';

const themeStore = useThemeStore();

const dropdownOpen = ref(false);
const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
};

const userStore = useUserStore();
const user = computed(() => userStore.user);
const route = useRoute();

const navigation = [
  { name: 'Dashboard', to: { name: 'Dashboard' }, icon: 'bar_chart' },
  { name: 'Map', to: { name: 'Map' }, icon: 'map' },
  { name: 'Report', to: { name: 'ReportTable' }, icon: 'report' },
  { name: 'Barangays', to: { name: 'Barangay' }, icon: 'home' },
  { name: 'Incidents', to: { name: 'Incident' }, icon: 'warning' },
];

const logout = () => {
//   Implement logout functionality
  axiosClient.post('/logout').then(() => {
    router.push({ name: 'Login' });
  });
};


const themeClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-800 border-black text-white" : "bg-sky-50 border-gray-200 text-gray-800"
})

const dropClasses = computed(() => {
  return themeStore.isDarkMode ? "bg-slate-600 border-black text-white" : "bg-white border-gray-200 text-gray-800"
})
const iconClasses = computed(() => {
  return themeStore.isDarkMode
    ? "text-white hover:text-gray-300 transition-colors"
    : "text-gray-800 hover:text-gray-600 transition-colors"
})

const signoutConfirmationVisible = ref(false);

const showSignoutConfirmation = () => {
    signoutConfirmationVisible.value = true;
};

const cancelSignout = () => {
    signoutConfirmationVisible.value = false;
};



</script>  

<template>
  <div>
      <nav class="fixed top-0 z-50 w-full border-b" :class="themeClasses">
          <div class="px-3 py-3 lg:px-5 lg:pl-3">
              <div class="flex items-center justify-between">
                  <div class="flex items-center justify-start rtl:justify-end">
                      <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar"
                          aria-controls="logo-sidebar" type="button"
                          class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                          <span class="sr-only">Open sidebar</span>
                          <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg">
                              <path clip-rule="evenodd" fill-rule="evenodd"
                                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z">
                              </path>
                          </svg>
                      </button>
                      <a href="#" class="flex ms-2 md:me-24">
                          <img src="../assets/baguio-logo.png" class="h-10 me-3" alt="Smart City Baguio" />
                          <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap" :class="themeClasses">SCCC-911 Dashboard</span>
                      </a>
                  </div>

                  <div class="flex items-center">
                      <div class="flex items-center ms-3 relative">
                          <button @click="toggleDropdown" type="button"
                              class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-sky-600"
                              aria-expanded="false">
                              <span class="sr-only">Open user menu</span>
                              <img class="w-8 h-8 rounded-full"
                                  src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                  alt="user photo">
                          </button>
                          <div v-show="dropdownOpen" 
                              class="absolute right-0 top-full mt-2 z-50 w-48 text-base list-none divide-y divide-gray-100 rounded-lg shadow-lg" :class="dropClasses">
                              <div class="px-4 py-3" role="none">
                                  <p class="text-sm" :class="dropClasses" role="none">
                                      {{ user?.firstname || 'Guest' }}
                                  </p>
                                  <p class="text-sm font-medium truncate" :class="dropClasses"
                                      role="none">
                                      {{ user?.email || 'No email' }}
                                  </p>
                              </div>
                              
                              <ul class="py-1" role="none">
                                  <li>
                                    <a @click="themeStore.toggleTheme" class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-sky-300 dark:hover:text-white" :class="dropClasses"
                                    role="menuitem">
                                        {{ themeStore.theme === "light" ? "🌞 Light Mode" : "🌙 Dark Mode" }}
                                    </a>
                                  </li>
                                  <li>
                                      <a @click="showSignoutConfirmation" class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-sky-300 dark:hover:text-white" :class="dropClasses">
                                          Sign Out
                                      </a>
                                  </li>
                              </ul>
                          </div>
                      </div>


                      <!--  
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable, 
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable, 
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable, 
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable, 
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable,
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable, 
                       maka this modal resusable, maka this modal resusable, maka this modal resusable, maka this modal resusable, 
                      -->
                      <div v-if="signoutConfirmationVisible" class="fixed inset-0 flex items-center justify-center">
                          <div class="fixed inset-0 bg-black opacity-60"></div>
                          <div class=" p-6 rounded-lg shadow-xl z-10" :class="themeClasses">
                              <h3 class="text-lg font-semibold mb-4 " :class="themeClasses">Sign out</h3>
                              <p class="mb-6" :class="themeClasses">Are you sure you want to sign out?</p>
                              <div class="flex justify-end gap-2">
                                  <button @click="cancelSignout" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-300">
                                      Cancel
                                  </button>
                                  <button @click="logout" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                      Sign out
                                  </button>
                              </div>
                          </div>
                      </div>

                  </div>
              </div>
          </div>
      </nav>

      <aside id="logo-sidebar"
          class="fixed top-0 left-0 z-40 w-56 h-screen pt-20 transition-transform -translate-x-full border-r sm:translate-x-0" :class="themeClasses"
          aria-label="Sidebar">
          <div class="h-full px-3 pb-4 overflow-y-auto" :class="themeClasses">
              <ul class="space-y-2 font-medium">
                  <li v-for='item in navigation' :key="item.name">
                      <RouterLink :to="item.to" :class="[
                          themeClasses,
                          route.name === item.to.name 
                              ? 'bg-gray-300 dark:bg-teal-400' 
                              : 'hover:bg-gray-300 dark:hover:bg-teal-300',
                          'flex my-2 items-center p-2 rounded-lg group'
                      ]">
                          <span :class="[
                              route.name === item.to.name 
                                  ? iconClasses
                                  : iconClasses,
                              'material-icons w-5 h-5 transition duration-75'
                          ]">
                              {{ item.icon }}
                          </span>
                          <span class="ms-3">{{ item.name }}</span>
                      </RouterLink>
                  </li>
              </ul>
          </div>
      </aside>

      <div class="pt-14 p-4 sm:ml-56" :class="dropClasses">
          <router-view />
      </div>
  </div>
</template>