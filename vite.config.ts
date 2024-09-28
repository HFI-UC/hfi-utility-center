import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            "/api": {
                target: "http://120.24.212.59/api",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    primevue: [
                        "primevue/button",
                        "primevue/tag",
                        "primevue/dialog",
                        "primevue/select",
                        "primevue/floatlabel",
                        "primevue/skeleton",
                        "primevue/card",
                        "primevue/toast",
                        "primevue/multiselect",
                        "primevue/datepicker",
                        "primevue/usetoast",
                        "primevue/inputtext",
                        "primevue/column",
                        "primevue/textarea",
                        "primevue/datatable",
                        "primevue/selectbutton"
                    ],
                    vue: ["vue", "vue-request", "vue-turnstile"],
                    axios: ["axios"],
                },
            },
        },
    },
});
