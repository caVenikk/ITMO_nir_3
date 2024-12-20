import { api } from "./index";
import { type GetIterationsVariantsResponse, type ProjectType } from "@/types/metrics";

export const getIterationsVariants = async (project: ProjectType) => {
    return await api.get<GetIterationsVariantsResponse>(`metrics/iterations/${project}`).json();
};
