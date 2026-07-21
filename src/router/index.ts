import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import { useIsLoading } from "@/eventBus";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
        },
        {
            path: "/reservation/create",
            name: "reservation-create",
            component: () => import("@/views/reservation/ReservationCreateView.vue"),
        },
        {
            path: "/reservation/search",
            name: "reservation-search",
            component: () => import("@/views/reservation/ReservationSearchView.vue"),
        },
        {
            path: "/reservation/analytics",
            name: "reservation-analytics",
            component: () => import("@/views/reservation/ReservationAnalyticsView.vue"),
        },
        {
            path: "/reservation/analytics/raw/overview",
            name: "reservation-analytics-raw-overview",
            component: () =>
                import("@/views/reservation/analytics/raw/ReservationAnalyticsOverviewView.vue"),
            meta: { hideNavbar: true },
        },
        {
            path: "/reservation/analytics/raw/weekly",
            name: "reservation-analytics-raw-weekly",
            component: () =>
                import("@/views/reservation/analytics/raw/ReservationAnalyticsWeeklyView.vue"),
            meta: { hideNavbar: true },
        },
        {
            path: "/user/login",
            name: "admin-login",
            component: () => import("@/views/user/UserLoginView.vue"),
        },
        {
            path: "/admin/user",
            name: "admin-dashboard",
            component: () => import("@/views/admin/UserManagementView.vue"),
        },
        {
            path: "/admin/facility",
            name: "admin-facility",
            component: () => import("@/views/admin/FacilityManagementView.vue"),
        },
        {
            path: "/admin/reservation",
            name: "admin-reservation",
            component: () => import("@/views/admin/ReservationManagementView.vue"),
        },
        {
            path: "/admin/ads",
            name: "admin-ads",
            component: () => import("@/views/admin/AdsManagementView.vue"),
        },
        {
            path: "/admin/ads-pricing",
            name: "admin-ads-pricing",
            component: () => import("@/views/admin/AdsPricingView.vue"),
        },
        {
            path: "/utiverse",
            name: "utiverse",
            component: () => import("@/views/UtiverseView.vue"),
        },

        {
            path: "/user/register",
            name: "user-register",
            component: () => import("@/views/user/UserRegisterView.vue"),
        },
        {
            path: "/user/ads",
            name: "user-ads",
            component: () => import("@/views/user/AdsManagementView.vue"),
        },
        {
            path: "/ads",
            name: "ads",
            component: () => import("@/views/ads/HomeView.vue"),
        },
        {
            path: "/ads/create",
            name: "ads-create",
            component: () => import("@/views/ads/AdsCreateView.vue"),
        },
        {
            path: "/ads/edit/:id",
            name: "ads-edit",
            component: () => import("@/views/ads/AdsEditView.vue"),
        }
    ],
});

const isLoading = useIsLoading();

router.beforeEach((_, __, next) => {
    isLoading.value = true;
    next();
});

router.afterEach(() => {
    isLoading.value = false;
});

export default router;
