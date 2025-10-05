import { createApp } from "vue";
import "@/style.css";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
// @ts-ignore
import { Sky } from "@/theme";
import { Chart } from "chart.js";
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';

Chart.register(WordCloudController, WordElement);
const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Sky,
        options: {
            darkModeSelector: "",
        },
    },
});
app.use(ToastService);
app.mount("#app");
