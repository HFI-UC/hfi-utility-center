import Homeview from "../views/Homeview.vue";
import ApplicationView from "../views/ApplicationView.vue";
import LoginView from "../views/LoginView.vue";
import { createRouter, createWebHistory } from "vue-router";
import ReservationView from "../views/ReservationView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            component: Homeview,
        },
        {
            path: "/reservation/create",
            component: ApplicationView,
            props: (route) => ({
                status: route.query.status,
                message: route.query.message,
            }),
        },
        {
            path: "/reservation/status",
            component: ReservationView,
        },
        {
            path: "/admin/login",
            component: LoginView
        }
    ],
});

export default router;
