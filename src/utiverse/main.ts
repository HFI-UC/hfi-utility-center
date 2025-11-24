import { createApp } from "vue";
import "@/style.css";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
// @ts-ignore
import { Sky } from "@/theme";
// @ts-ignore
import en_us from "@/assets/i18n/en-US.json";
// @ts-ignore
import zh_cn from "@/assets/i18n/zh-CN.json";
// @ts-ignore
import zh_ms from "@/assets/i18n/zh-MS.json";
import { createI18n } from "vue-i18n";

const app = createApp(App);
const i18n = createI18n({
    legacy: false,
    locale: "en-US",
    messages: {
        "en-US": en_us,
        "zh-CN": zh_cn,
        "zh-MS": zh_ms,
    },
});
app.use(i18n);
app.use(PrimeVue, {
    theme: {
        preset: Sky,
        options: {
            darkModeSelector: ".p-dark",
        },
    },
});
app.use(ToastService);
app.mount("#app");
