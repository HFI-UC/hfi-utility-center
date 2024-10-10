import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import router from "./router/router";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import { Vio } from "./styles/theme";

const app = createApp(App);
app.use(router);
app.use(ToastService);
app.use(PrimeVue, {
    theme: {
        preset: Vio,
        options: {
            darkModeSelector: ".p-dark",
        },
    },
});
app.directive("tooltip", Tooltip);
app.mount("#app");
