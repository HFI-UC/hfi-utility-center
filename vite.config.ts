import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path, { resolve } from "path";
import components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import "dotenv/config";

// https://vite.dev/config/
const __dirname = "src";
export default defineConfig({
    appType: "mpa",
    root: path.resolve(__dirname),
    plugins: [
        vue(),
        tailwindcss(),
        components({ resolvers: [PrimeVueResolver()] }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname),
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
        outDir: path.resolve(__dirname, "../dist"),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                "reservation-create": resolve(
                    __dirname,
                    "reservation/create/index.html"
                ),
                "reservation-search": resolve(
                    __dirname,
                    "reservation/search/index.html"
                ),
                "reservation-analytics": resolve(__dirname, "reservation/analytics/index.html"),
                "reservation-analytics-raw-general": resolve(__dirname, "reservation/analytics/raw/overview/index.html"),
                "reservation-analytics-raw-weekly": resolve(__dirname, "reservation/analytics/raw/weekly/index.html"),
                "admin-admin": resolve(__dirname, "admin/admin/index.html"),
                "admin-login": resolve(__dirname, "admin/login/index.html"),
                "admin-dashboard": resolve(
                    __dirname,
                    "admin/dashboard/index.html"
                ),
                "admin-reservation": resolve(
                    __dirname,
                    "admin/reservation/index.html"
                ),
                "admin-facility": resolve(
                    __dirname,
                    "admin/facility/index.html"
                ),
            },
            output: {
                manualChunks: (id) => {
                    if (id.includes("LoadingMask.vue")) return "loading-mask";
                    if (id.includes("AdminLogin.vue")) return "admin-login";
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
