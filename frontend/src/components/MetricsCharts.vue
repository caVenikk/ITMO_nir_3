<script setup lang="ts">
import { computed } from "vue";
import { useMetricsStore } from "@/stores/metrics";
import type { StatsData } from "@/types/metrics";
import MetricBarCharts from "./charts/MetricBarCharts.vue";
import MetricBoxPlots from "./charts/MetricBoxPlots.vue";

const store = useMetricsStore();

const calculateStats = (data: number[]) => {
    const sorted = [...data].sort((a, b) => a - b);
    const len = sorted.length;
    return {
        min: sorted[0],
        q1: sorted[Math.floor(len * 0.25)],
        median: sorted[Math.floor(len * 0.5)],
        q3: sorted[Math.floor(len * 0.75)],
        max: sorted[len - 1],
        mean: sorted.reduce((a, b) => a + b, 0) / len,
        outliers: sorted,
    };
};

const statsData = computed((): StatsData => {
    if (!store.metrics.length) return {} as StatsData;

    const result: StatsData = {};
    const tools = new Set(store.metrics.map((m) => m.tool));

    tools.forEach((tool) => {
        const metrics = store.metrics.filter((m) => m.tool === tool);
        result[tool] = {
            execution: calculateStats(metrics.map((m) => m.execution_time)),
            cpu: calculateStats(metrics.map((m) => m.cpu_usage)),
            memory: calculateStats(metrics.map((m) => m.memory_usage)),
        };
    });

    return result;
});
</script>

<template>
    <div class="metrics-chart-list">
        <div class="metrics-container">
            <h2 class="metrics-title">Графики метрик</h2>
            <MetricBarCharts :stats-data="statsData" />
            <MetricBoxPlots :stats-data="statsData" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.metrics-chart-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
</style>
