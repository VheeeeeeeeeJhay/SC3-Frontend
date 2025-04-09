<script setup>
    import axiosClient from '../axios'

    const sendMail = async () => {
        try {
            const res = await axiosClient.get('http://localhost:8000/api/911/test-mail',{ headers: { 'x-api-key': import.meta.env.VITE_API_KEY } }) // replace with your Laravel URL
            console.log(res.data.message) // Mail sent successfully
            alert("Email sent!")
        } catch (error) {
            console.error("Failed to send mail:", error)
        }
    }
</script>

<template>
    <button @click="sendMail" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send Test Mail</button>
</template>