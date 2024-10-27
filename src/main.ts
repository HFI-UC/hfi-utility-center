import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import router from "./router/router";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import { Vio } from "./styles/theme";
import { createI18n } from "vue-i18n";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import en_us from "./assets/i18n/en_us.json";
import zh_cn from "./assets/i18n/zh_cn.json";
import zh_ms from "./assets/i18n/zh_ms.json";
import ja_jp from "./assets/i18n/ja_jp.json";
import ko_kr from "./assets/i18n/ko_kr.json";

const app = createApp(App);
const i18n = createI18n({
    locale: localStorage.getItem("locale") || "en_us",
    fallbackLocale: "en_us",
    messages: {
        en_us,
        zh_cn,
        zh_ms,
        ja_jp,
        ko_kr,
    },
});
inject();
injectSpeedInsights();
app.use(i18n);
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
