import { api } from "./index";
import { type ProjectType } from "@/types/metrics";

export const getMetrics = async (project: ProjectType, iterations: number) => {
    return await api.get(`metrics/${project}?iterations=${iterations}`).blob();
};
