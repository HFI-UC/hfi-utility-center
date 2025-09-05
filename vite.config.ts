import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import mpa from "vite-plugin-mpa";
import path from "path";
import components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        // @ts-ignore
        mpa.default(),
        components({ resolvers: [PrimeVueResolver()] }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    assetsInclude: ["**/*.riv", "**/*.wasm"],
});
