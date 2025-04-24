<script setup>
import { reactive, ref, onMounted, watchEffect, inject } from 'vue'
import { storeToRefs } from 'pinia'
import useUserStore from '../../stores/user.js'

const addToast = inject('addToast')

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const showModal = ref(false)
const showPasswordModal = ref(false)

const editData = reactive({
  id: null,
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  old_password: '',
  password: '',
  password_confirmation: ''
})

onMounted(async () => {
  await userStore.fetchUser()
})

watchEffect(() => {
  if (user.value) {
    editData.id = user.value.id
    editData.firstName = user.value.firstName ?? ''
    editData.middleName = user.value.middleName ?? ''
    editData.lastName = user.value.lastName ?? ''
    editData.email = user.value.email ?? ''
  }
})

const saveChanges = async () => {
  try {
    await userStore.updateUser(editData)
    addToast('Profile updated successfully', 'success', 'check_circle')
    showModal.value = false
    showPasswordModal.value = false
    editData.old_password = ''
    editData.password = ''
    editData.password_confirmation = ''
  } catch (error) {
    addToast(error.response?.data?.error || error.message, 'error', 'error')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-[#f4f4f9] to-[#f0f0f4] dark:bg-gradient-to-br dark:from-black dark:via-[#02021b] dark:to-black text-black dark:text-white shadow-[rgba(0,0,255,0.3)_0px_15px_25px,_rgba(255,0,0,0.22)_0px_10px_10px] flex items-center justify-center p-6 transition-colors duration-500">

    <div class="bg-white/10 dark:bg-black/30 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-5xl p-10 transition-all duration-300 border border-white/10 dark:border-gray-800">
      <div class="flex flex-col md:flex-row items-center justify-between">
        
        <!-- Profile Section -->
        <div class="md:w-1/3 text-center mb-10 md:mb-0">
          <div class="w-48 h-48 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-7xl font-bold shadow-2xl border-4 border-white/20 dark:border-gray-800">
            {{ user?.email?.charAt(0).toUpperCase() || '?' }}
          </div>
          <h1 class="text-3xl font-extrabold text-gray-700 dark:text-gray-200 mb-2 tracking-tight">
            {{ user?.firstName }} {{ user?.middleName }} {{ user?.lastName }}
          </h1>
          <p class="text-lg text-gray-700 dark:text-gray-200">User Account</p>
          <button
            class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full shadow-md transition-transform hover:scale-105"
            @click="showModal = true"
          >
            Edit Profile
          </button>
        </div>

        <!-- Info Section -->
        <div class="md:w-2/3 md:pl-12">
          <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Account Details</h2>
          <ul class="space-y-4 text-base text-gray-700 dark:text-gray-200">
            <li><strong class="text-indigo-400 dark:text-indigo-300">First Name:</strong> {{ user?.firstName }}</li>
            <li><strong class="text-indigo-400 dark:text-indigo-300">Middle Name:</strong> {{ user?.middleName ||''}}</li>
            <li><strong class="text-indigo-400 dark:text-indigo-300">Last Name:</strong> {{ user?.lastName }}</li>
            <li><strong class="text-indigo-400 dark:text-indigo-300">Email:</strong> {{ user?.email }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white dark:bg-gray-900 border border-white/10 dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative animate-glow">
          <h3 class="text-2xl font-bold text-indigo-600 dark:text-white mb-8 text-center">Edit Profile</h3>

          <!-- Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input type="text" v-model="editData.firstName"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
              <input type="text" v-model="editData.middleName"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input type="text" v-model="editData.lastName"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" v-model="editData.email"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center mt-10">
            <button
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              @click="showPasswordModal = true"
            >
              Change Password
            </button>
            <div class="flex gap-3">
              <button
                @click="showModal = false"
                class="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Cancel
              </button>
              <button
                @click="saveChanges"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Change Password Modal -->
    <transition name="fade">
      <div v-if="showPasswordModal" class="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white dark:bg-gray-900 border border-white/10 dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-xl p-8 animate-glow">
          <h4 class="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6 text-center">Change Password</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Old Password</label>
              <input type="password" v-model="editData.old_password"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" v-model="editData.password"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input type="password" v-model="editData.password_confirmation"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-4 mt-8">
            <button
              @click="showPasswordModal = false"
              class="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              Cancel
            </button>
            <button
              @click="saveChanges"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold">
              Save Password
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>


<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Blue animated glow */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 12px 3px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 24px 6px rgba(59, 130, 246, 0.8);
  }
}
.animate-glow {
  animation: glow 2.5s ease-in-out infinite;
}
</style>
