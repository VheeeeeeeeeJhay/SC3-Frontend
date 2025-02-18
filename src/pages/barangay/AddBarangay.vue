<script setup>
import { ref } from 'vue';
import PrimaryButton from '../../components/PrimaryButton.vue';
import router from '../../router.js';
import axiosClient from '../../axios.js';

const data = ref({
  name: ''
})

const errors = ref({
  name: []
});

function formSubmit() {
  const formData = new FormData()
  formData.append('name', data.value.name)
  axiosClient.post("/api/911/barangay", formData, {
    headers: {
      'x-api-key':'$m@rtC!ty'
    }
    })
    .then(response => {
      data.value.name = '';
      router.push({ name: 'Barangay' })
    })
    // .catch(error => {
    //   console.log(error.response.data)
    //   errors.value = error.response.data.errors;
    // })
}
</script>

<template>
    <div>
        <form @submit.prevent="formSubmit">
            <input 
                type="text" 
                v-model="data.name" 
                placeholder="Enter value" 
                class="px-4 py-2 border rounded-md mr-2 text-white bg-gray-600"
            />
            <!-- <p class="text-sm mt-1 text-red-600">
              {{ errors.name ? errors.name[0] : '' }}
            </p> -->
            <PrimaryButton name="Add" type="submit" class="bg-green-500 hover:bg-green-600 hover:shadow-md"/>
        </form>
    </div>
</template>