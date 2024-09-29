import Homeview from "../views/Homeview.vue";
import ApplicationView from "../views/ApplicationView.vue";
import LoginView from "../views/LoginView.vue";
import ReservationsManagementView from "../views/ReservationsManagementView.vue";
import ReservationView from "../views/ReservationView.vue";
import ReservationActionsView from "../views/ReservationActionsView.vue";
import PolicySettingsView from "../views/PolicySettingsView.vue";
import { createRouter, createWebHistory } from "vue-router";

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
        },
        {
            path: "/admin/reservations",
            component: ReservationsManagementView
        },
        {
            path: "/admin/approval",
            component: ReservationActionsView,
            props: (route) => ({
                token: route.query.token,
                action: route.query.action
            })
        },
        {
            path: "/admin/policy",
            component: PolicySettingsView
        }
    ],
});

export default router;
