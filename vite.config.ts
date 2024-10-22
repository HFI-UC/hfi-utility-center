import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import sitemap from 'vite-plugin-sitemap'

const dynamicRoutes = [
    "/reservation/create",
    "/reservation/status",
    "/admin/login",
    "/admin/reservations",
    "/admin/approval",
    "/admin/policy",
    "/maintenance"
]

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), sitemap({ hostname: "https://www.hfiuc.org", readable: true, dynamicRoutes: dynamicRoutes})],
    server: {
        proxy: {
            "/api": {
                target: "http://120.24.212.59/api",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
