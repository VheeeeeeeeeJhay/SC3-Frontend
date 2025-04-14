<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import useUserStore from "../../stores/user.js";
import axiosClient from "../../axios.js";
import router from "../../router.js";

// Ref for dropdown modal
const dropdownOpen = ref(false);
const dropdownModalRef = ref(null);

// Close modal when clicking outside of it
const closeDropdownOnClickOutside = (event) => {
  // Check if the click is outside the dropdown modal
  if (
    dropdownModalRef.value &&
    !dropdownModalRef.value.contains(event.target)
  ) {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  // Add event listener to document
  document.addEventListener("click", closeDropdownOnClickOutside);
});

onUnmounted(() => {
  // Cleanup event listener when component unmounts
  document.removeEventListener("click", closeDropdownOnClickOutside);
});

// Other setup code
const theme = ref(localStorage.getItem("theme") || "light");
const signout_visible = ref(false);
const toggleTheme = () => {
  if (theme.value === "light") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    theme.value = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    theme.value = "light";
  }
};

onMounted(() => {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
    theme.value = "dark";
  }
});

const userStore = useUserStore();
const user = computed(() => userStore.user);
const route = useRoute();

const navigation = [
  { name: "Overview", to: { name: "Overview" }, icon: "bar_chart" },
  { name: "Map", to: { name: "Map" }, icon: "map" },
  { name: "Report", to: { name: "ReportTable" }, icon: "report" },
  { name: "Barangays", to: { name: "Barangay" }, icon: "home" },
  { name: "Users",
    to: { name: "UsersTable" },
    icon: "people",
    requiredRole: 1,
  }, // Add a requiredRole property for role-based access
  { name: "Logs", to: { name: "Logs" }, icon: "lock", requiredRole: 1 },
];

const isActive = (item) => {
    if (route.name === item.to.name) return true;
    if (item.to.name === 'ReportTable' && ['AddReport', 'ReportViewDetails', 'EditReport', 'ImportFile'].includes(route.name)) return true;
    if (item.to.name === 'Barangay' && ['EditBarangay', 'UpdateBarangay', 'DeleteBarangay', 'BarangayStatistics'].includes(route.name)) return true;
    if (item.to.name === 'Logs' && ['LogViewDetails'].includes(route.name)) return true;
    return false;
};

const filteredNavigation = computed(() => {
  return navigation.filter((item) => {
    if (!item.requiredRole) return true;
    return user.value?.role === item.requiredRole;
  });
});

const logout = () => {
  axiosClient.post("/logout").then(() => {
    router.push({ name: "Login" });
  });
};

const signoutConfirmationVisible = ref(false);
const showSignoutConfirmation = () => {
  signoutConfirmationVisible.value = true;
};
const cancelSignout = () => {
  signoutConfirmationVisible.value = false;
};

const sidebarVisible = ref(false);
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};
const closeSidebar = () => {
  sidebarVisible.value = false;
};
</script>

<template>
    <div class="min-h-screen flex">
      <!-- Sidebar (Main) -->
      <aside
  id="logo-sidebar"
  class="fixed top-0 left-0 z-40 w-56 h-screen transition-transform duration-300
         bg-white dark:bg-black dark:text-white 
         shadow-[rgba(0,0,255,0.3)_0px_15px_25px,_rgba(255,0,0,0.22)_0px_10px_10px] 
         border-r-10 border-solid dark:border-gray-950 
         ring-1 ring-gray-300 dark:ring-slate-900 rounded-r-1xl
         backdrop-blur-md overflow-hidden"
  :class="sidebarVisible ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'"
>
  <div class="h-full flex flex-col justify-between relative z-10 px-3 pb-4 overflow-y-auto">

    <!-- Logo Section (Less Top Padding + Separated Logo/Text) -->
    <div class="pt-11 flex flex-col items-center">
      <span class="text-center text-lg font-semibold sm:text-xl text-gray-800 dark:text-white">
        SC3-911 Dashboard
      </span>
      <img src="../../assets/baguio-logo.png" class="h-40 mb-2" alt="Smart City Baguio" />
    </div>

    <!-- Navigation Links -->
    <div class="flex-1 mt-6">
      <ul class="space-y-2 font-medium">
        <li v-for="item in filteredNavigation" :key="item.name">
          <RouterLink
            :to="item.to"
            :class="[ 
              'flex items-center p-2 rounded-lg group', 
              isActive(item) 
                ? 'bg-[#FFFFF0] dark:bg-slate-600 shadow-md' 
                : 'hover:bg-[#D9D9B3] dark:hover:bg-slate-600' 
            ]"
          >
            <span
              class="material-icons w-5 h-5 transition duration-75"
              :class="isActive(item) ? 'text-gray-800 dark:!text-white' : 'text-gray-800 dark:!text-gray-300'"
            >
              {{ item.icon }}
            </span>
            <span class="ms-3">{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- User Profile at Bottom -->
    <div class="mt-auto pt-6 border-t border-gray-300 dark:border-slate-700">
      <div class="flex items-center gap-3 px-2">
        <button
          @click.stop="dropdownOpen = !dropdownOpen"
          type="button"
          class="flex justify-center items-center bg-gray-800 rounded-full hover:ring-4 hover:ring-green-500 transition-all duration-300"
        >
          <img
            class="w-10 h-10 rounded-full"
            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            alt="user photo"
          />
        </button>
        <div class="flex flex-col">
          <p class="text-xs font-medium text-gray-800 dark:text-white">
            {{ user?.firstname || 'Guest' }}
          </p>
          <p class="text-xs truncate text-gray-600 dark:text-gray-400">
            {{ user?.email || 'No email' }}
          </p>
        </div>
      </div>
    </div>

  </div>
</aside>

<!-- Right Sidebar Modal with Bottom-Up Slide Animation -->
<transition name="slide">
  <div
    v-show="dropdownOpen"
    ref="dropdownModalRef"
    class="fixed bottom-[6rem] left-4 z-50 w-45 rounded-xl bg-white dark:bg-slate-700 shadow-lg text-gray-800 dark:text-white p-4 transition-all duration-300"
  >
    <div class="px-4 py-3">
      <p class="text-sm text-gray-800 dark:text-white">
        {{ user?.firstname || 'Guest' }}
      </p>
      <p class="text-sm font-medium truncate text-gray-600 dark:text-gray-300">
        {{ user?.email || 'No email' }}
      </p>
    </div>

    <ul class="py-1">
      <li>
        <button
          @click.stop="toggleTheme"
          class="theme-toggle block w-full text-start px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-slate-600 dark:hover:text-white"
        >
          <div v-if="theme === 'light'">🌞 Light Mode</div>
          <div v-else>🌙 Dark Mode</div>
        </button>
      </li>
      <li>
        <RouterLink
          to="/profile"
          class="block px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-slate-600 dark:hover:text-white"
        >
          Profile
        </RouterLink>
      </li>
      <li>
        <a
          @click="showSignoutConfirmation"
          class="block px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-slate-600 dark:hover:text-white"
        >
          Sign Out
        </a>
      </li>
    </ul>
  </div>
</transition>

  
      <!-- Content Area -->
      <div class="sm:ml-56 flex-1 bg-white dark:bg-gray-950 transition-all duration-300">
        <router-view />
      </div>
  
      <!-- Sign Out Confirmation Modal -->
      <div v-if="signoutConfirmationVisible" class="fixed inset-0 flex items-center justify-center">
        <div class="fixed inset-0 bg-black opacity-60"></div>
        <div class="p-6 rounded-lg shadow-xl z-10 bg-sky-50 dark:bg-slate-800">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sign out</h3>
          <p class="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to sign out?</p>
          <div class="flex justify-end gap-2">
            <button @click="cancelSignout" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button @click="logout" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(50px); /* Start from the left */
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0); /* End at the normal position */
  opacity: 1;
}

/* Glowing border effect */
#logo-sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  border-right: 2px solid transparent;
  border-radius: 0 1rem 1rem 0;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(to right, transparent, rgba(0, 4, 58, 0.411));
  filter: blur(12px);
  opacity: 0.8;
}
</style>
