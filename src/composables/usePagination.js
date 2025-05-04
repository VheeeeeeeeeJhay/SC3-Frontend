import { ref, computed, watch } from 'vue';

export function usePagination(dataRef, options = {}) {
    const currentPage = ref(1);
    const itemsPerPage = ref(options.itemsPerPage || 10);
    const maxVisiblePages = options.maxVisiblePages || 3;

    const totalPages = computed(() => {
        return Math.ceil(dataRef.value.length / itemsPerPage.value);
    });

    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return dataRef.value.slice(start, end);
    });

    const paginationStart = computed(() => {
        if (currentPage.value <= Math.floor(maxVisiblePages / 2)) {
            return 1;
        } else if (currentPage.value + Math.floor(maxVisiblePages / 2) >= totalPages.value) {
            return Math.max(1, totalPages.value - maxVisiblePages + 1);
        } else {
            return currentPage.value - Math.floor(maxVisiblePages / 2);
        }
    });

    const paginationEnd = computed(() => {
        return Math.min(totalPages.value, paginationStart.value + maxVisiblePages - 1);
    });

    const visiblePages = computed(() => {
        return Array.from(
            { length: paginationEnd.value - paginationStart.value + 1 },
            (_, i) => paginationStart.value + i
        );
    });

    const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--;
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    };

    const resetPage = () => {
        currentPage.value = 1;
    };

    return {
        currentPage,
        itemsPerPage,
        totalPages,
        paginatedData,
        visiblePages,
        nextPage,
        prevPage,
        goToPage,
        resetPage,
    };
}
