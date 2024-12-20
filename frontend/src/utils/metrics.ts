import type { MetricRow, ProjectType, RawMetricRow } from "@/types/metrics";

export const convertMetricRow = (raw: RawMetricRow): MetricRow => ({
    tool: raw["Tool"],
    execution_time: raw["Execution Time (s)"],
    cpu_usage: raw["CPU Used (%)"],
    memory_usage: raw["Memory Used (KB)"],
});

export const mapProjectName = (project: ProjectType) => {
    const map = {
        fastapi: "FastAPI",
        flask: "Flask",
    };

    return map[project];
};
