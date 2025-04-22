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
            } else if (!passwordRegex.test(newPassword)) {
                passwordError.value = 'Password must contain at least 1 lowercase, 1 uppercase, 1 digit, and 1 special character.';
            } else {
                passwordError.value = '';
            }
        }, 1000)
    }), { immediate: true };

    return {
        emailError,
        passwordError
    };
}