import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useActionDropdown() {
    const openDropdownId = ref(null);
    const dropdownRefs = ref([]);

    const closeDropdown = () => {
        openDropdownId.value = null;
    };

    const toggleDropdown = (reportId) => {
        openDropdownId.value = openDropdownId.value === reportId ? null : reportId;
    };

    const handleClickOutside = (event) => {
        if (
            openDropdownId.value !== null &&
            !dropdownRefs.value[openDropdownId.value]?.contains(event.target)
        ) {
            closeDropdown();
        }
    };

    onMounted(() => {
        document.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
        document.removeEventListener("click", handleClickOutside);
    });

    return {
        openDropdownId,
        dropdownRefs,
        closeDropdown,
        toggleDropdown,
    };
}
