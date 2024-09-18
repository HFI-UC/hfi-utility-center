import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import router from './router/router'
import 'primeicons/primeicons.css'
import { definePreset } from '@primevue/themes'


const app = createApp(App)
app.use(router)

const Voilet = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{voilet.50}',
            100: '{voilet.100}',
            200: '{voilet.200}',
            300: '{voilet.300}',
            400: '{voilet.400}',
            500: '{voilet.500}',
            600: '{voilet.600}',
            700: '{voilet.700}',
            800: '{voilet.800}',
            900: '{voilet.900}',
            950: '{voilet.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{voilet.950}',
                    inverseColor: '#ffffff',
                    hoverColor: '{voilet.900}',
                    activeColor: '{voilet.800}'
                },
                highlight: {
                    background: '{voilet.950}',
                    focusBackground: '{voilet.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '{voilet.50}',
                    inverseColor: '{voilet.950}',
                    hoverColor: '{voilet.100}',
                    activeColor: '{voilet.200}'
                },
                highlight: {
                    background: 'rgba(250, 250, 250, .16)',
                    focusBackground: 'rgba(250, 250, 250, .24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        }
    }
})

app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: Voilet,
        options: {
            darkModeSelector: '.p-dark'
        }
    }
})
app.mount('#app')