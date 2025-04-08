<template>
<div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full p-8 transition-all duration-300 animate-fade-in">
    <div class="flex flex-col md:flex-row">
        <div class="md:w-1/3 text-center mb-8 md:mb-0">
        <img 
            src="https://i.pravatar.cc/300" 
            alt="Profile Picture" 
            class="rounded-full w-48 h-48 mx-auto mb-4 border-4 border-indigo-800 dark:border-blue-900 transition-transform duration-300 hover:scale-105"
        />
        <h1 class="text-2xl font-bold text-indigo-800 dark:text-white mb-2">John Doe</h1>
        <p class="text-gray-600 dark:text-gray-300">Software Developer</p>
        <button 
            class="mt-4 bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors duration-300"
            @click="editProfile"
        >
            Edit Profile
        </button>
        </div>
        <div class="md:w-2/3 md:pl-8">
        <h2 class="text-xl font-semibold text-indigo-800 dark:text-white mb-4">About Me</h2>
        <p class="text-gray-700 dark:text-gray-300 mb-6">
            Passionate software developer with 5 years of experience in web technologies. 
            I love creating user-friendly applications and solving complex problems.
        </p>
        <h2 class="text-xl font-semibold text-indigo-800 dark:text-white mb-4">Skills</h2>
        <div class="flex flex-wrap gap-2 mb-6">
            <span 
            v-for="skill in skills" 
            :key="skill" 
            class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm transition-transform duration-300 transform hover:scale-105 hover:bg-blue-900 hover:text-white"
            >
            {{ skill }}
            </span>
        </div>
        <h2 class="text-xl font-semibold text-indigo-800 dark:text-white mb-4">Contact Information</h2>
        <ul class="space-y-2 text-gray-700 dark:text-gray-300">
            <li class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-800 dark:text-blue-900" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            john.doe@example.com
            </li>
            <li class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-800 dark:text-blue-900" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            +1 (555) 123-4567
            </li>
            <li class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-800 dark:text-blue-900" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            San Francisco, CA
            </li>
        </ul>
        </div>
    </div>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue';

const skills = ref(["JavaScript", "React", "Node.js", "Python", "SQL"]);

const editProfile = () => {
alert("Edit profile clicked!");
};
</script>

<style scoped>
@keyframes fadeIn {
from { opacity: 0; transform: translateY(-10px); }
to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
animation: fadeIn 0.5s ease-out forwards;
}
</style>
