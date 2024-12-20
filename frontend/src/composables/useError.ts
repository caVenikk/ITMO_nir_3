import { computed, type Ref } from "vue";

interface HasErrorState {
    error: Ref<string>;
}

export const useError = <T extends HasErrorState>(stores: T[]) => {
    const error = computed(() => stores.some((store) => store.error.value));

    return {
        error,
    };
};
