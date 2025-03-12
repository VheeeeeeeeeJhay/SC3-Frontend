<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axiosClient from '../../axios.js';
import { RouterLink } from 'vue-router';
import PrimaryButton from '../../components/PrimaryButton.vue';
import Loader1 from '../../components/loading/loader1.vue';
import TabNavigation from '../../components/TabNavigation.vue';

</script>

<template>
    <section class="w-full min-h-screen">
        <!-- Titleee -->
        <div class="mt-6 px-2 flex justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Users Management</h1>
        </div>
        <TabNavigation />
    </section>

</template>