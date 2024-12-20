import { ref } from "vue";

const openSelectId = ref<symbol | null>(null);

export function useSelectDropdown() {
    const id = Symbol();

    const registerOpen = () => {
        openSelectId.value = id;
    };

    const unregisterOpen = () => {
        if (openSelectId.value === id) {
            openSelectId.value = null;
        }
    };

    const shouldClose = () => {
        return openSelectId.value !== null && openSelectId.value !== id;
    };

    return {
        registerOpen,
        unregisterOpen,
        shouldClose,
    };
}
