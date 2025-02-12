<template>
    <div :class="bgClass" style="min-height: 100vh;">
        <div class="mx-4" :class>
        <h1 class="text-2xl font-bold mb-6 text-gray-100">Incident Report Form</h1>
        
        <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Source of Report -->
                <div class="form-group">
                    <label for="source" class="block text-sm font-medium text-gray-300 mb-2">
                        Source of Report*
                    </label>
                    <Dropdown
                        id="source"
                        v-model="formData.source"
                        :options="reportSources"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Select source"
                        class="w-full bg-gray-700"
                        :required="true"
                    />
                </div>

                <!-- Type of Incident -->
                <div class="form-group">
                    <label for="incidentType" class="block text-sm font-medium text-gray-300 mb-2">
                        Case Classification
                    </label>
                    <Dropdown
                        id="incidentType"
                        v-model="formData.incidentType"
                        :options="incidentTypes"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Select incident type"
                        class="w-full bg-gray-700"
                        :required="true"
                    />
                </div>
                <div>
                    <label for="incidentType" class="block text-sm font-medium text-gray-300 mb-2">
                        Incident/Case (ex. brawl)
                    </label>
                    <Dropdown
                        id="incidentType"
                        v-model="formData.incident"
                        :options="incident"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Select incident"
                        class="w-full bg-gray-700"
                        :required="true"
                    />
                </div>
            </div>

            <!-- Place -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
                <label for="place" class="block text-sm font-medium text-gray-300 mb-2">
                    Place of Incident 
                </label>
                <InputText
                    id="place"
                    v-model="formData.place"
                    placeholder="Enter the location of the incident (128 barangay)"
                    class="w-full bg-gray-700 text-gray-100"
                    required
                />
            </div>

            <div class="form-group">
                <label for="titude" class="block text-sm font-medium text-gray-300 mb-2">
                    Longitude and Latitude
                </label>
                
                <InputText
                    id="Longitude"
                    v-model="formData.Longitude"
                    placeholder="Enter Longitude"
                    class="w-full bg-gray-700 text-gray-100"
                    required
                />
            </div>
            <div class="form-group">
                <InputText
                    id="details"
                    v-model="formData.details"
                    placeholder="Enter location details/landmarks"
                    class="w-full bg-gray-700 text-gray-100"
                    required
                />
            </div>
            <div class="form-group">
                <InputText
                    id="Latitude"
                    v-model="formData.Latitude"
                    placeholder="Enter Latitude"
                    class="w-full bg-gray-700 text-gray-100"
                    required
                />
            </div>
        </div>
            <!-- Actions Taken -->
            <div class="form-group">
                <label for="actionType" class="block text-sm font-medium text-gray-300 mb-2">
                    Type of Action*
                </label>
                <Dropdown
                    id="actionType"
                    v-model="formData.actionType"
                    :options="actionTypes"
                    optionLabel="name"
                    optionValue="value"
                    placeholder="Select action type"
                    class="w-full bg-gray-700"
                    :required="true"
                />
            </div>

    
<!-- modify for form inputs -->
            <div class="flex justify-end space-x-4">
                <Button
                    type="button"
                    label="Clear"
                    class="p-button-secondary"
                    @click="formData = {
                        source: '',
                        incidentType: '',
                        place: '',
                        actionType: ''
                    }"
                />
                <Button
                    type="submit"
                    label="Submit Report"
                    class="p-button-success"
                />
            </div>
        </form>
    </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { useThemeStore } from '../stores/themeStore';

const themeStore = useThemeStore();

const bgClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
})
const textClass = computed(() => {
  return themeStore.isDarkMode ? 'text-gray-100' : 'text-gray-900';
})
const boxClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-800' : 'bg-white';
})
const chartClass = computed(() => {
  return themeStore.isDarkMode ? 'bg-gray-700 border-gray-500' : 'bg-gray-200 border-gray-900';
})


const formData = ref({
    source: '',
    incidentType: '',
    incident: '',
    place: '',
    actionsTaken: '',
    actionType: ''
});

const reportSources = [
    { name: '911', value: '911' },
    { name: 'CDRRMO', value: 'cdrrmo' },
    { name: 'Icom Radio', value: 'icomradio' },
    { name: 'EMS Hotline', value: 'emshotline' },
    { name: 'Other', value: 'other' }
];

const incidentTypes = [
    { name: 'Medical Assistance', value: 'medical' },
    { name: 'Police Assistance', value: 'police' },
    { name: 'Fire Assistance', value: 'fire' },
    { name: 'Rescue Assistance', value: 'rescue' },
    { name: 'General Assistance', value: 'general' },
    { name: 'Other', value: 'other' }
];

const incident = [
    { name: 'Brawl', value: 'brawl' },
    { name: 'Assault', value: 'assault' },
    { name: 'Vandalism', value: 'vandalism' },
    { name: 'Traffic Violation', value: 'traffic' },
    { name: 'Suspicious Activity', value: 'suspicious' },
    { name: 'Other', value: 'other' }
];

const actionTypes = [
    { name: 'Solved', value: 'solved' },
    { name: 'Pending', value: 'pending' },
    { name: 'Referred', value: 'referred' }
];

const submitForm = () => {
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData.value);
};
</script>

<style scoped>
.form-group :deep(.p-dropdown),
.form-group :deep(.p-inputtext) {
    width: 100%;
}
</style>
