<script setup lang="ts">
import { useMetricsStore, useProjectsStore, useIterationsStore } from "@/stores";
import MetricsTable from "@/components/MetricsTable.vue";
import MetricsCharts from "@/components/MetricsCharts.vue";
import { storeToRefs } from "pinia";
import MetricsForm from "./components/MetricsForm.vue";
import Spinner from "./components/ui/Spinner.vue";
import ErrorBox from "./components/ui/ErrorBox.vue";
import Accordion from "./components/ui/Accordion.vue";
import AccordionItem from "./components/ui/AccordionItem.vue";
import { computed, ref } from "vue";

const metricsStore = useMetricsStore();
const projectsStore = useProjectsStore();
const iterationsStore = useIterationsStore();

const { isLoading: isLoadingMetrics, error: errorMetrics, metrics } = storeToRefs(metricsStore);
const { isLoading: isLoadingProjects, error: errorProjects } = storeToRefs(projectsStore);
const { isLoading: isLoadingIterations, error: errorIterations } = storeToRefs(iterationsStore);

const isLoading = computed(() => isLoadingMetrics.value || isLoadingProjects.value || isLoadingIterations.value);
const error = computed(() => errorMetrics.value || errorProjects.value || errorIterations.value);

const openSection = ref("");
</script>

<template>
    <div>
        <h1>Анализ производительности статических анализаторов кода</h1>
        <MetricsForm />
        <div class="spinner-wrapper" v-if="isLoading">
            <Spinner />
        </div>
        <ErrorBox v-else-if="error" :message="error" />
        <div v-else-if="!isLoading && !error && metrics.length > 0">
            <Accordion v-model="openSection">
                <AccordionItem name="table" title="Таблица с данными">
                    <MetricsTable />
                </AccordionItem>
            </Accordion>
            <MetricsCharts />
        </div>
        <div v-else-if="!isLoading && !error && metrics.length === 0">
            <p class="no-data">Нет данных для отображения</p>
        </div>
    </div>
</template>

<style scoped>
h1 {
    margin-bottom: 2rem;
    text-align: center;
}

.spinner-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin-top: 2rem;
}

.no-data {
    margin-top: 2rem;
    text-align: center;
}
</style>
