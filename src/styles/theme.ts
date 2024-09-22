import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

export const Vio = definePreset(Aura, {
    semantic: {
        primary: {
            50: "{violet.50}",
            100: "{violet.100}",
            200: "{violet.200}",
            300: "{violet.300}",
            400: "{violet.400}",
            500: "{violet.500}",
            600: "{violet.600}",
            700: "{violet.700}",
            800: "{violet.800}",
            900: "{violet.900}",
            950: "{violet.950}",
        },
        colorScheme: {
            light: {
                primary: {
                    color: "{violet.700}",
                    inverseColor: "#ffffff",
                    hoverColor: "{violet.800}",
                    activeColor: "{violet.800}",
                },
                highlight: {
                    background: "{violet.950}",
                    focusBackground: "{violet.700}",
                    color: "#ffffff",
                    focusColor: "#ffffff",
                },
            },
            dark: {
                primary: {
                    color: "{zinc.50}",
                    inverseColor: "{zinc.950}",
                    hoverColor: "{zinc.100}",
                    activeColor: "{zinc.200}",
                },
                highlight: {
                    background: "rgba(250, 250, 250, .16)",
                    focusBackground: "rgba(250, 250, 250, .24)",
                    color: "rgba(255,255,255,.87)",
                    focusColor: "rgba(255,255,255,.87)",
                },
            },
        },
    },
});