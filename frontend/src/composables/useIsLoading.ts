import { computed, type Ref } from "vue";

interface HasLoadingState {
    isLoading: Ref<boolean>;
}

export const useLoading = <T extends HasLoadingState>(stores: T[]) => {
    const isLoading = computed(() => stores.some((store) => store.isLoading.value));

    return {
        isLoading,
    };
};
