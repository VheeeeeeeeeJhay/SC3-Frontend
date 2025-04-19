<script setup>
import { ref } from 'vue';

const verifyEmail = () => {
 console.log('Verify Email');   
}

</script>

<template>
    <div class="flex flex-col sm:flex-row justify-center items-center gap-8 max-w-6xl mx-auto">
        <PrimaryButton name="Verify Email" @click="verifyEmail" />
    </div>
</template>

<style scoped></style>