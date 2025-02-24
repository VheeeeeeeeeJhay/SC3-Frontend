<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '../../axios.js';
import FormInput from '../../components/FormInput.vue';

const route = useRoute();
const router = useRouter();
const report_Id = route.params.id;

const data = ref({
    name: '',
    source: '',
    assistance: '',
    incident: '',
    actions: '',
    date_received: '',
    arrival_on_site: '',
    time: '',
    barangay: '',
    landmark: '',
    longitude: '',
    latitude: '',
});

const errorMessage = ref(''); // Define errorMessage
const isLoading = ref(false); // Define loading state

onMounted(() => {
    isLoading.value = true; // Set loading to true
    axiosClient.get(`/api/911/report-edit/${report_Id}`, {
        headers: {
            'x-api-key': '$m@rtC!ty'
        }
    })
    .then((res) => {
        console.log(res);
        data.value = res.data;
        // data.value = {
        //     name: report.name || '',
        //     source: report.source?.sources || '',
        //     incidentType: report.incident?.type || '',
        //     incident: report.incident_id || '',
        //     actionType: report.actions?.actions || '',
        //     receivedDate: report.date_received || '',
        //     arrivalTime: report.arrival_on_site || '',
        //     incidentTime: report.time || '',
        //     barangay: report.barangay?.name || '',
        //     details: report.landmark || '',
        //     longitude: report.Longitude || '',
        //     latitude: report.Latitude || ''
        // }; // Assign response data to data.value
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
        errorMessage.value = 'Failed to load data. Please try again later.';
    })
    .finally(() => {
        isLoading.value = false; // Set loading to false after fetching
    });
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex justify-center">
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading...</span>
        </div>
    </div>
    <div v-else>
        <form>
            <h1>Edit Report</h1>
            <div>
                <label for="name">Name</label>
                <FormInput name="name" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.name" /> 
            </div>
            <div>
                <label for="source">Source</label>
                <FormInput name="source" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.source.sources" />
            </div>
            <div>
                <label for="incidentType">Incident Type</label>
                <FormInput name="incidentType" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.assistance.assistance" />
            </div>
            <div>
                <label for="incident">Incident</label>
                <FormInput name="incident" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.incident.type" />
            </div>
            <div>
                <label for="actionType">Action Type</label>
                <FormInput name="actionType" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.actions.actions" />
            </div>
            <div>
                <label for="receivedDate">Received Date</label>
                <FormInput type="date" name="receivedDate" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.date_received" />
            </div>
            <div>
                <label for="arrivalTime">Arrival Time</label>
                <FormInput type="time" name="arrivalTime" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.arrival_on_site" />
            </div>
            <div>
                <label for="incidentTime">Incident Time</label>
                <FormInput type="time" name="incidentTime" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.time" />
            </div>
            <div>
                <label for="barangay">Barangay</label>
                <FormInput name="barangay" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.barangay.name" />
            </div>
            <div>
                <label for="landmark">Landmark</label>
                <FormInput name="landmark" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.landmark" />
            </div>
            <div>
                <label for="longitude">Longitude</label>
                <FormInput name="longitude" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.longitude" />
            </div>
            <div>
                <label for="latitude">Latitude</label>
                <FormInput name="latitude" class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600" v-model="data.latitude" />
            </div>
        </form>
    </div>
  </div>
</template>