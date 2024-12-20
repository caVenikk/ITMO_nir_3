<script setup lang="ts">
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import type { StatsData } from "@/types/metrics";

const props = defineProps<{
    statsData: StatsData;
}>();

const meanCharts = computed(() => ({
    execution: {
        labels: Object.keys(props.statsData),
        datasets: [
            {
                label: "Среднее время выполнения (с)",
                data: Object.values(props.statsData).map((d) => d.execution.mean),
                backgroundColor: "rgba(135, 206, 235, 0.8)",
            },
        ],
    },
    cpu: {
        labels: Object.keys(props.statsData),
        datasets: [
            {
                label: "Среднее использование ЦП (%)",
                data: Object.values(props.statsData).map((d) => d.cpu.mean),
                backgroundColor: "rgba(144, 238, 144, 0.8)",
            },
        ],
    },
    memory: {
        labels: Object.keys(props.statsData),
        datasets: [
            {
                label: "Среднее использование памяти (KB)",
                data: Object.values(props.statsData).map((d) => d.memory.mean),
                backgroundColor: "rgba(255, 182, 193, 0.8)",
            },
        ],
    },
}));

const translateMetric = (metric: string): string => {
    const map: Record<string, string> = {
        execution: "время выполнения",
        cpu: "использование ЦП",
        memory: "использование памяти",
    };

    return map[metric];
};

const chartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: { display: false },
    },
    scales: { y: { beginAtZero: true } },
});
</script>

<template>
    <div class="metric-chart">
        <h3 class="metric-chart-title">Среднее значение метрик по анализатору</h3>
        <div class="charts-list">
            <div class="chart-container" v-for="(chart, metric) in meanCharts" :key="metric">
                <h3>Среднее {{ translateMetric(metric) }} по анализатору</h3>
                <Bar :data="chart" :options="chartOptions()" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.metric-chart {
    width: 100%;
    margin-bottom: 2rem;

    &-title {
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--color-text-light);
        margin-bottom: 1rem;
    }
}

.charts-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;

    .chart-container {
        border-radius: 0.5rem;
        padding: 1rem;
        padding-bottom: 3.5rem;
        height: 400px;
        background-color: var(--color-hover);
        border: 1px solid var(--color-border);

        h3 {
            text-align: center;
            margin-bottom: 1rem;
        }
    }
}
</style>
