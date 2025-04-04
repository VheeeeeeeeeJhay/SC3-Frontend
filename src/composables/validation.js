import { reactive, watch } from 'vue';

export function useFormValidation() {
  const form = reactive({
    email: '',
    password: '',
    errors: {
      email: '',
      password: ''
    }
  });

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email address.';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return '';
  };

  watch(
    () => form.email,
    (newValue) => {
      form.errors.email = validateEmail(newValue);
    }
  );

  watch(
    () => form.password,
    (newValue) => {
      form.errors.password = validatePassword(newValue);
    }
  );

  const isValid = () => {
    form.errors.email = validateEmail(form.email);
    form.errors.password = validatePassword(form.password);
    return !form.errors.email && !form.errors.password;
  };

  return {
    form,
    isValid
  };
}


//sadad
{/* <script setup>
import { useFormValidation } from './useFormValidation';

const { form, isValid } = useFormValidation();

const submitForm = () => {
  if (isValid()) {
    console.log('Form Submitted:', form);
  } else {
    console.log('Validation errors:', form.errors);
  }
};
</script>

<template>
  <form @submit.prevent="submitForm">
    <div>
      <label for="email">Email:</label>
      <input id="email" v-model="form.email" type="text" />
      <span class="error">{{ form.errors.email }}</span>
    </div>
    <div>
      <label for="password">Password:</label>
      <input id="password" v-model="form.password" type="password" />
      <span class="error">{{ form.errors.password }}</span>
    </div>
    <button type="submit">Submit</button>
  </form>
</template> */}
