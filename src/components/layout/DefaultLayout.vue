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
  { name: "Users", to: { name: "UsersTable" }, icon: "people", requiredRole: 1 },
  { name: "Logs", to: { name: "Logs" }, icon: "lock", requiredRole: 1 },
  { name: "Hotline", to: { name: "HotlineManagement" }, icon: "phone" },
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
    <aside id="logo-sidebar"
          class="fixed top-0 left-0 z-40 w-56 h-screen transition-transform duration-300
                dark:text-white overflow-hidden
                bg-white/30 dark:bg-black/20 backdrop-blur-sm
                border-r border-white/10 shadow-lg"
          :class="sidebarVisible ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'">


      <div class="h-full flex flex-col justify-between relative z-10 px-1 pb-4 overflow-y-auto">
        <!-- Logo Section -->
        <div class="pt-11 flex flex-col items-center">
          <span class="text-center text-lg font-semibold sm:text-xl text-gray-800 dark:text-white">
            SC3-911 Dashboard
          </span>
          <img src="../../assets/baguio-logo.png" class="h-40 mb-2" alt="Smart City Baguio" />
        </div>

        <!-- Navigation -->
        <nav class="flex-1 mt-6 space-y-2">
          <ul class="space-y-1">
            <li v-for="item in filteredNavigation" :key="item.name">
              <RouterLink :to="item.to"
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group',
                  isActive(item)
                    ? 'bg-sky-100 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold shadow-sm'
                    : 'hover:bg-sky-50 dark:hover:bg-slate-800'
                ]">
                <span class="material-icons text-base group-hover:scale-110 transition-transform duration-200"
                  :class="isActive(item) ? 'text-indigo-600 dark:text-teal-300' : 'text-slate-600 dark:text-slate-300'">
                  {{ item.icon }}
                </span>
                <span class="ms-3">{{ item.name }}</span>
              </RouterLink>
            </li>
          </ul>
        </nav>

        <!-- User -->
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-3 px-2">
            <button
              @click.stop="dropdownOpen = !dropdownOpen"
              type="button"
              class="flex justify-center items-center bg-gray-800 rounded-full hover:ring-4 hover:ring-teal-500 transition-all duration-300"
            >
              <div
                class="w-10 h-10 flex items-center justify-center rounded-full bg-teal-600 text-white text-lg font-bold shadow ring-2 ring-white dark:ring-teal-400">
                {{ user?.email?.charAt(0).toUpperCase() || '?' }}
              </div>
            </button>
            <div class="flex flex-col">
              <p class="text-sm font-medium">{{ user?.firstName || 'Guest' }}
                <span class="text-xs font-normal text-slate-500 dark:text-slate-400">({{ user?.role === 1 ? 'Admin' : 'User' }})</span>
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ user?.email || 'No email' }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Right Sidebar Modal with Bottom-Up Slide Animation -->
    <transition name="slide">
      <div v-show="dropdownOpen" ref="dropdownModalRef"
        class="fixed bottom-[6rem] left-4 z-50 w-45 rounded-xl bg-white dark:bg-slate-700 shadow-lg text-gray-800 dark:text-white p-4 transition-all duration-300">
        <div class="px-4 py-3">
          <p class="text-sm text-gray-800 dark:text-white">
            {{ user?.firstname || 'Guest' }}
          </p>
          <p class="text-sm font-medium truncate text-gray-600 dark:text-gray-300">
            {{ user?.email || 'No email' }}
          </p>
        </div>

        <ul class="py-1 space-y-1">
  <li>
    <RouterLink
      to="/profile"
      class="block px-4 py-2 text-sm hover:bg-[#D9D9B3] dark:hover:bg-slate-600 dark:hover:text-white"
    >
      Profile
    </RouterLink>
  </li>
  <li>
    <a
      @click="showSignoutConfirmation"
      class="block px-4 py-2 text-sm hover:bg-[#D9D9B3] dark:hover:bg-slate-600 dark:hover:text-white"
    >
      Sign Out
    </a>
  </li>

  <!-- Theme Toggle Separator -->
  <li class="border-t border-gray-200 dark:border-slate-600 mt-2"></li>

  <!-- Theme Switch Label -->
  <li class="px-4 pt-3">
    <p class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
      {{ theme === 'dark' ? 'Dark Mode' : 'Light Mode' }}
    </p>
  </li>

  <!-- Theme Switch -->
  <li class="px-4 pb-2 flex justify-start">
    <label class="switch">
      <input
        type="checkbox"
        :checked="theme === 'dark'"
        @change="toggleTheme"
      />
      <span class="slider">
        <div class="star star_1"></div>
        <div class="star star_2"></div>
        <div class="star star_3"></div>
        <svg viewBox="0 0 16 16" class="cloud_1 cloud">
          <path
            transform="matrix(.77976 0 0 .78395-299.99-418.63)"
            fill="#fff"
            d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
          />
        </svg>
      </span>
    </label>
  </li>
</ul>

      </div>
    </transition>

    <!-- Content Area -->
    <div class="sm:ml-56 flex-1 transition-all duration-300">
      <router-view />
    </div>

    <!-- Sign Out Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="signoutConfirmationVisible" class="fixed inset-0 z-[1000] flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[1000]"></div>

        <!-- Modal Content -->
        <div class="relative z-[1001] p-6 max-w-sm w-full rounded-lg shadow-xl bg-sky-50 dark:bg-slate-800">
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
    </transition>
  </div>
</template>

<style scoped>
.mainBody {
  background: radial-gradient(circle at top left, #1d1f33, #0d0e20);
  color: white;
  font-family: 'Inter', sans-serif;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(50px);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Modal fade animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
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
  /* border-right: 2px solid transparent;
  border-radius: 0 1rem 1rem 0;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(to right, transparent, rgba(0, 4, 58, 0.411));
  filter: blur(12px);
  opacity: 0.8; */
}
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background: #87ceeb;
  border-radius: 34px;
  transition: background-color 0.4s;
  overflow: hidden;
}

.slider .star {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.9;
  box-shadow: 0 0 2px #fff;
}

.star_1 {
  top: 8px;
  left: 12px;
  width: 2px;
  height: 2px;
}

.star_2 {
  top: 4px;
  left: 20px;
  width: 3px;
  height: 3px;
}

.star_3 {
  top: 12px;
  left: 30px;
  width: 2.5px;
  height: 2.5px;
}

.cloud_1 {
  position: absolute;
  top: 4px;
  right: 8px;
  width: 16px;
  height: 16px;
  opacity: 0.8;
  transition: transform 0.4s ease;
}

input:checked + .slider {
  background: #2e3a59;
}

input:checked + .slider .cloud_1 {
  transform: translateX(-20px);
}
</style>
