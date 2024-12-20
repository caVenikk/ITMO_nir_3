import { defineStore } from "pinia";
import { ref } from "vue";
import { getMetrics } from "@/api";
import Papa from "papaparse";
import type { MetricRow, ParseResult, ProjectType } from "@/types/metrics";
import { convertMetricRow } from "@/utils/metrics";

export const useMetricsStore = defineStore("metrics", () => {
    const metrics = ref<MetricRow[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchMetrics = async (project: ProjectType, iterations: number) => {
        metrics.value = [];
        isLoading.value = true;
        error.value = null;

        try {
            const blob = await getMetrics(project, iterations);
            const text = await blob.text();

            const { data } = await new Promise<ParseResult>((resolve, reject) => {
                Papa.parse(text, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results: ParseResult) => resolve(results),
                    error: reject,
                });
            });

            metrics.value = data.map(convertMetricRow);
        } catch (e) {
            error.value = e instanceof Error ? e.message : "Failed to fetch metrics";
            console.error("Error fetching metrics:", e);
        } finally {
            isLoading.value = false;
        }
    };

    const setMetrics = (newMetrics: MetricRow[]) => {
        metrics.value = newMetrics;
    };

    return {
        metrics,
        isLoading,
        error,
        fetchMetrics,
        setMetrics,
    };
});
