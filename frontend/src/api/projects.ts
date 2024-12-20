import { api } from "./index";
import { type GetProjectsResponse } from "@/types/metrics";

export const getProjects = async () => {
    return await api.get<GetProjectsResponse>("metrics/projects").json();
};
