import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import "dotenv/config";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        components({ resolvers: [PrimeVueResolver()] }),
    ],
    resolve: {
        alias: {
            "@": path.resolve("src"),
        },
    },
    assetsInclude: ["**/*.riv", "**/*.wasm"],
    define: {
        "process.env": {
            BACKEND_URL: process.env.BACKEND_URL,
            CLOUDFLARE_KEY: process.env.CLOUDFLARE_KEY,
        },
    },
    build: {
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes("LoginView.vue")) return "login-view";
                    if (id.includes("AdminView.vue")) return "admin-view";
                    if (id.includes("ReservationView.vue")) return "reservation-view";
                    if (id.includes("FacilityView.vue")) return "facility-view";
                    if (id.includes("CreateView.vue")) return "reservation-create-view";
                    if (id.includes("SearchView.vue")) return "reservation-search-view";
                    if (id.includes("AnalyticsView.vue")) return "reservation-analytics-view";
                    if (id.includes("OverviewView.vue")) return "reservation-analytics-raw-overview-view";
                    if (id.includes("WeeklyView.vue")) return "reservation-analytics-raw-weekly-view";
                    if (id.includes("UtiverseView.vue")) return "utiverse-view";
                    if (id.includes("LoadingMask.vue")) return "loading-mask";
                    if (id.includes("Navbar.vue")) return "navbar";
                    if (id.includes("lucide")) return "lucide";
                    if (id.includes("primevue")) return "primevue";
                    if (id.includes("chart.js")) return "chartjs";
                    if (id.includes("rive")) return "rive";
                },
            },
        },
    },
});
