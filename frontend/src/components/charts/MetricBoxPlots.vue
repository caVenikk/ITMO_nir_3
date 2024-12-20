<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Chart } from "chart.js";
import type { StatsData } from "@/types/metrics";

const props = defineProps<{
    statsData: StatsData;
}>();

const boxplotRefs = ref<(HTMLCanvasElement | null)[]>([null, null, null]);

type MetricKey = "execution" | "cpu" | "memory";

const translateMetric = (metric: MetricKey): string => {
    const map: Record<MetricKey, string> = {
        execution: "Время выполнения",
        cpu: "Использование ЦП",
        memory: "Использование памяти",
    };
    return map[metric];
};

const boxplotDatasets = computed(() => ({
    execution: {
        labels: Object.keys(props.statsData),
        datasets: [
            {
                label: "Время выполнения (с)",
                data: Object.values(props.statsData).map((d) => d.execution),
                backgroundColor: "rgba(135, 206, 235, 0.8)",
            },
        ],
    },
    cpu: {
        labels: Object.keys(props.statsData),
        datasets: [
            {
                label: "Использование ЦП (%)",
                data: Object.values(props.statsData).map((d) => d.cpu),
                backgroundColor: "rgba(144, 238, 144, 0.8)",
            },
        ],
    },
    memory: {
        labels: Object.keys(props.statsData),
        datasets: [
            {
                label: "Использование памяти (KB)",
                data: Object.values(props.statsData).map((d) => d.memory),
                backgroundColor: "rgba(255, 182, 193, 0.8)",
            },
        ],
    },
}));

const createBoxPlot = (canvas: HTMLCanvasElement, data: any, _metric: MetricKey) => {
    new Chart(canvas, {
        type: "boxplot",
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label(item: any) {
                            const stats = item.raw;
                            return [
                                `Min: ${stats.min.toFixed(3)}`,
                                `Q1: ${stats.q1.toFixed(3)}`,
                                `Median: ${stats.median.toFixed(3)}`,
                                `Q3: ${stats.q3.toFixed(3)}`,
                                `Max: ${stats.max.toFixed(3)}`,
                            ];
                        },
                    },
                },
            },
        },
    });
};

onMounted(() => {
    const metrics: MetricKey[] = ["execution", "cpu", "memory"];
    boxplotRefs.value.forEach((ref, index) => {
        if (ref) {
            createBoxPlot(ref, boxplotDatasets.value[metrics[index]], metrics[index]);
        }
    });
});
</script>

<template>
    <div class="metric-chart">
        <h3 class="metric-chart-title">Диаграммы размаха метрик по анализаторам</h3>
        <div class="charts-list">
            <div v-for="(_dataset, metric, index) in boxplotDatasets" :key="metric" class="chart-container">
                <h3>{{ translateMetric(metric as MetricKey) }} для каждого анализатора</h3>
                <canvas :ref="(el) => (boxplotRefs[index] = el as HTMLCanvasElement)"></canvas>
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
