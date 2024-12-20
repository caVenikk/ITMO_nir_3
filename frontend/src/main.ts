import { createApp } from "vue";
import { createPinia } from "pinia";
import { Chart, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { BoxPlotController, BoxAndWiskers } from "@sgratzl/chartjs-chart-boxplot";
import "./style.scss";
import App from "./App.vue";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, BoxPlotController, BoxAndWiskers, Title, Tooltip, Legend);

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
