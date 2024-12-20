<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import CustomSelect from "./ui/CustomSelect.vue";
import { storeToRefs } from "pinia";
import { useMetricsStore, useIterationsStore, useProjectsStore } from "@/stores";
import type { ProjectType } from "@/types/metrics";
import { mapProjectName } from "@/utils/metrics";

interface MetricsFormState {
    project: ProjectType | null;
    iterations: number | null;
}

const initialState = {
    project: null,
    iterations: null,
};

const form = ref<MetricsFormState>(initialState);
const projectsStore = useProjectsStore();
const iterationsStore = useIterationsStore();
const metricsStore = useMetricsStore();

const { projects } = storeToRefs(projectsStore);
const { iterations } = storeToRefs(iterationsStore);
const { metrics } = storeToRefs(metricsStore);

const { fetchProjects } = projectsStore;
const { fetchIterations } = iterationsStore;
const { fetchMetrics } = metricsStore;

const mappedProjectsNames = computed(() => {
    return projects.value.map((project) => ({
        label: mapProjectName(project),
        value: project,
    }));
});

watch(
    () => form.value.project,
    async (newProject) => {
        if (newProject) {
            form.value.iterations = null;
            await fetchIterations(newProject);
        } else {
            form.value.iterations = null;
            iterations.value = [];
            metrics.value = [];
        }
    },
);

watch(
    () => form.value.iterations,
    (newIterations) => {
        if (form.value.project && newIterations) {
            fetchMetrics(form.value.project, newIterations);
        } else if (!newIterations) {
            metrics.value = [];
        }
    },
);

onMounted(() => {
    fetchProjects();
});
</script>

<template>
    <div class="metrics-container">
        <h2 class="metrics-title">Выбор параметров (проект и количество итераций)</h2>
        <div class="metrics-form">
            <CustomSelect
                v-model="form.project"
                :items="mappedProjectsNames"
                placeholder="Проект"
                searchable
                clearable
            />

            <CustomSelect
                v-model="form.iterations"
                :items="iterations"
                :disabled="!form.project"
                placeholder="Количество итераций"
                searchable
                clearable
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.metrics-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 1.5rem;
}

.metrics-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-element);
}
</style>
