import { getIterationsVariants } from "@/api";
import type { ProjectType } from "@/types/metrics";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useIterationsStore = defineStore("iterations", () => {
    const iterations = ref<number[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchIterations = async (project: ProjectType) => {
        iterations.value = [];
        isLoading.value = true;
        error.value = null;

        try {
            const response = await getIterationsVariants(project);
            iterations.value = response.iterations;
        } catch (e: any) {
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    return { iterations, isLoading, error, fetchIterations };
});
