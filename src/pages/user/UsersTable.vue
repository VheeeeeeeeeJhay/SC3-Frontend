<script setup>
import TabNavigation from '../../components/tabs/TabNavigation.vue';

</script>

<template>
    <section class="w-full min-h-screen p-4">
        <!-- Title -->
        <div class="mt-6 px-2 flex justify-between items-center">
            <h1 class="text-2xl font-bold dark:text-white text-center sm:text-left">
                Users Management
            </h1>
        </div>
        
        <!-- Tab Navigation -->
        <TabNavigation class="mt-4" />
    </section>
</template>

