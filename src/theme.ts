import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

export const Sky = definePreset(Aura, {
    semantic: {
        primary: {
            50: "{sky.50}",
            100: "{sky.100}",
            200: "{sky.200}",
            300: "{sky.300}",
            400: "{sky.400}",
            500: "{sky.500}",
            600: "{sky.600}",
            700: "{sky.700}",
            800: "{sky.800}",
            900: "{sky.900}",
            950: "{sky.950}",
        },
        colorScheme: {
            light: {
                primary: {
                    color: "{sky.500}",
                    inverseColor: "#ffffff",
                    hoverColor: "{sky.600}",
                    activeColor: "{sky.700}",
                },
                highlight: {
                    background: "{sky.400}",
                    focusBackground: "{sky.500}",
                    color: "#ffffff",
                    focusColor: "#ffffff",
                },
            },
            dark: {
                primary: {
                    color: "{sky.500}",
                    inverseColor: "{sky.950}",
                    hoverColor: "{sky.400}",
                    activeColor: "{sky.200}",
                },
                highlight: {
                    background: "{sky.950}",
                    focusBackground: "{sky.700}",
                    color: "#ffffff",
                    focusColor: "#ffffff",
                },
            },
        },
    },
});