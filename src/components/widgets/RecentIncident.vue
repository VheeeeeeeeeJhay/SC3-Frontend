<script setup>
import { onMounted, computed, onUnmounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { useArrayStore } from '../../stores/arrayStore';

let refreshInterval = null;
const databaseStore = useDatabaseStore();

onMounted(() => {
    databaseStore.fetchData();
    refreshInterval = setInterval(() => {
        databaseStore.fetchData();
    }, 50000);
});

onUnmounted(() => {
  // Clear the interval when the component is unmounted or page is reloaded
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

const computedProperties = {
    recents: "recents",
};

const {
    recents,
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

const store = useArrayStore();
const passingData = (recent) => {
    store.clearData();
    store.setData(recent);
}

onUnmounted(() => {
    store.clearData();
})
</script>

<template>
    <!-- Title -->
    <div class="w-full h-full p-4 dark:text-white text-gray-800">   
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Most Recent Reports</h2>
        </div>
        
        <!-- <div v-for="recent in recents" :key="recent.id" class="border-l-5 border-teal-500 mb-2">
            <div class="block p-2 bg-white border border-gray-200 rounded-tr-lg rounded-br-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            <h5 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">{{ recent.incident.type }}</h5>
            <div class="grid grid-cols-2 grid-rows-1 gap-4">
                <div>
                    <p class="font-normal text-gray-700 dark:text-gray-400 truncate">Barangay: </p>
                    <span class="font-bold">{{ recent.barangay.name }}</span></div>
                <div>
                    <p class="font-normal text-gray-700 dark:text-gray-400 truncate">Assistance: </p>
                    <span class="font-bold">{{ recent.assistance.assistance }}</span>
                </div>
            </div>
            <RouterLink :to="{ name: 'ReportViewDetails', params: { id: recent.id } }"
                class="block  py-2 hover:italic dark:hover:text-blue-600">
                View Details>>>
            </RouterLink>
            </div>
        </div> -->
        
        <div v-for="recent in recents" :key="recent.id" class="border-l-5 border-teal-500 mb-2">
            <!-- <RouterLink @click="passingData(recent)" :to="{ name: 'ReportViewDetails', params: { id: recent.id } }" class="block pt-0.5 hover:italic dark:hover:text-blue-600">
                <div class="block p-2 bg-white border border-gray-200 rounded-tr-lg rounded-br-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <p class="text-[12px] tracking-tight text-gray-900 dark:text-white">{{ recent.incident.type }}</p>  
                    <p class="text-[12px] tracking-tight text-gray-900 dark:text-white">{{ recent.assistance.assistance }} - {{ recent.actions.actions }}</p>
                    <p class="text-[12px] tracking-tight text-gray-900 dark:text-white truncate">{{ recent.barangay.name }}</p> 
                    
                    <div class="relative group w-full max-w-md py-1">
                        <div class="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                    </div>
                </div>
            </RouterLink> -->
            <RouterLink
                @click="passingData(recent)"
                :to="{ name: 'ReportViewDetails', params: { id: recent.id } }"
                class="group block pt-0.5 hover:italic dark:hover:text-blue-600"
                >
                <div class="relative block p-2 bg-white border border-gray-200 rounded-tr-lg rounded-br-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out">

                    <!-- Animated line -->
                    <span class="absolute bottom-1 left-2 h-0.5 bg-blue-500 w-0 group-hover:w-[calc(100%-1rem)] transition-all duration-500 ease-out"></span>
                    <!-- Content -->
                    <p class="text-[12px] tracking-tight text-gray-900 dark:text-white">
                    {{ recent.incident.type }}
                    </p>
                    <p class="text-[12px] tracking-tight text-gray-900 dark:text-white">
                    {{ recent.assistance.assistance }} - {{ recent.actions.actions }}
                    </p>
                    <p class="text-[12px] tracking-tight text-gray-900 dark:text-white truncate">
                    {{ recent.barangay.name }}
                    </p>
                </div>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped></style>
