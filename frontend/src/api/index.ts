import ky from "ky";
import { getProjects } from "./projects";
import { getIterationsVariants } from "./iterations";
import { getMetrics } from "./metrics";

console.log(import.meta.env.VITE_API_BASE_URL);

export const api = ky.create({
    prefixUrl: import.meta.env.VITE_API_BASE_URL,
});

export { getProjects, getIterationsVariants, getMetrics };
