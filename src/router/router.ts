import Homeview from "../views/Homeview.vue";
import ReservationsView from "../views/ReservationsView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Homeview
        },
        {
            path: '/reservation/create',
            name: 'reservation',
            component: ReservationsView
        }
    ]
})

export default router