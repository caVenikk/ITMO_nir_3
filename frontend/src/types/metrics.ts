export interface RawMetricRow {
    Tool: string;
    "Execution Time (s)": number;
    "CPU Used (%)": number;
    "Memory Used (KB)": number;
}

export interface MetricRow {
    tool: string;
    execution_time: number;
    cpu_usage: number;
    memory_usage: number;
}

export interface ParseResult {
    data: RawMetricRow[];
    errors: any[];
    meta: {
        delimiter: string;
        linebreak: string;
        aborted: boolean;
        truncated: boolean;
        cursor: number;
    };
}

export interface Stats {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    mean: number;
    outliers: number[];
}

export interface StatsData {
    [tool: string]: {
        execution: Stats;
        cpu: Stats;
        memory: Stats;
    };
}

export type ProjectType = "flask" | "fastapi";

export interface GetIterationsVariantsResponse {
    iterations: number[];
}

export interface GetProjectsResponse {
    projects: ProjectType[];
}
