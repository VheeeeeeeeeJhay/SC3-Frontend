import { ref, watch } from 'vue';

export function useAuthValidation(data) {
    const emailError = ref('');
    let debounceEmailTimeout;

    watch(() => data.value.email, (newEmail) => {
        clearTimeout(debounceEmailTimeout); // cancel the last timeout
        
        debounceEmailTimeout = setTimeout(() => {
            if (newEmail.length === 0) {
                emailError.value = '';
            } else if (!newEmail.includes("@")) {
                emailError.value = 'Email must contain an @ symbol.';
            } else{
                emailError.value = '';
            }
        }, 1000);
    }, { immediate: true });
    
    let debouncePasswordTimeout;
    const passwordError = ref('')
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    watch(() => data.value.password, (newPassword) => {
        clearTimeout(debouncePasswordTimeout); // cancel the last timeout
        
        debouncePasswordTimeout = setTimeout(() => {
            if (newPassword.length === 0) {
              passwordError.value = '';
            } else if (newPassword.length < 8) {
                passwordError.value = 'Password must be at least 8 characters long.';
            // } else if (!passwordRegex.test(newPassword)) {
            //     passwordError.value = 'Password must contain at least 1 lowercase, 1 uppercase, 1 digit, and 1 special character.';
            } else {
                passwordError.value = '';
            }
        }, 1000)
    }, { immediate: true });

    let debounceConfirmPasswordTimeout;
    const confirmPasswordError = ref('')
    watch(() => data.value.password_confirmation, (newConfirmPassword) => {
        clearTimeout(debounceConfirmPasswordTimeout); // cancel the last timeout
        
        debounceConfirmPasswordTimeout = setTimeout(() => {
            if (!newConfirmPassword) {
                confirmPasswordError.value = '';
            } else if(newConfirmPassword !== data.value.password) {
                confirmPasswordError.value = 'Passwords do not match.';
            } else {
                confirmPasswordError.value = '';
            }
        }, 1000)
    }, { immediate: true });

    let debounceFirstNameTimeout;
    const firstNameError = ref('')
    watch(() => data.value.firstName, (newFirstName) => {
        clearTimeout(debounceFirstNameTimeout); // cancel the last timeout
        
        debounceFirstNameTimeout = setTimeout(() => {
            if (!newFirstName) {
                firstNameError.value = '';
            } else if(newFirstName.length < 2) {
                firstNameError.value = 'First name must be at least 2 characters long.';
            } else {
                firstNameError.value = '';
            }
        }, 1000)
    }, { immediate: true });

    let debounceLastNameTimeout;
    const lastNameError = ref('')
    watch(() => data.value.lastName, (newLastName) => {
        clearTimeout(debounceLastNameTimeout); // cancel the last timeout
        
        debounceLastNameTimeout = setTimeout(() => {
            if (!newLastName) {
                lastNameError.value = '';
            } else if(newLastName.length < 2) {
                lastNameError.value = 'Last name must be at least 2 characters long.';
            } else {
                lastNameError.value = '';
            }
        }, 1000)
    }, { immediate: true });

    return {
        emailError,
        passwordError,
        confirmPasswordError,
        firstNameError,
        lastNameError
    };
}