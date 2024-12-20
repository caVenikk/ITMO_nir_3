import { getProjects } from "@/api";
import type { ProjectType } from "@/types/metrics";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useProjectsStore = defineStore("projects", () => {
    const projects = ref<ProjectType[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchProjects = async () => {
        projects.value = [];
        isLoading.value = true;
        error.value = null;

        try {
            const response = await getProjects();
            projects.value = response.projects;
        } catch (e: any) {
            error.value = e.message;
        } finally {
            isLoading.value = false;
        }
    };

    return { projects, isLoading, error, fetchProjects };
});
