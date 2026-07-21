import { onMounted, watch, ref, onUnmounted } from "vue";
import { getCheckLogin } from "@/api";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { triggerLoginUpdate, useLoginEvent } from "@/eventBus";

const cachedLoginStatus = ref<any>(null);
let globalLoginScheduler: NodeJS.Timeout | null = null;
const LOGIN_CHECK_INTERVAL = 5 * 60 * 1000;

const startGlobalLoginScheduler = () => {
    if (globalLoginScheduler) {
        clearInterval(globalLoginScheduler);
    }
    
    getCheckLogin().then((response) => {
        if (response.success) {
            cachedLoginStatus.value = response.data;
        }
    });

    globalLoginScheduler = setInterval(async () => {
        try {
            const response = await getCheckLogin();
            if (response.success) {
                cachedLoginStatus.value = response.data;
            } else {
                cachedLoginStatus.value = null;
            }
        } catch (error) {
            console.error("Error checking login status:", error);
        }
    }, LOGIN_CHECK_INTERVAL);
};

const stopGlobalLoginScheduler = () => {
    if (globalLoginScheduler) {
        clearInterval(globalLoginScheduler);
        globalLoginScheduler = null;
    }
};

export interface AuthGuardOptions {
    requireLogin: boolean;
    redirect?: string;
    requiredRole?: "admin" | "approver" | "student" | "system" | "teacher" | string[];
    watchLoginEvent?: boolean;
}

export function useAuthGuard(options: AuthGuardOptions) {
    const { t } = useI18n();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const loginEvent = useLoginEvent();

    const {
        requireLogin,
        redirect,
        requiredRole,
        watchLoginEvent = true
    } = options;

    const checkLoginStatus = async () => {
        if (requireLogin) {
            let response = cachedLoginStatus.value ? 
                { success: true, data: cachedLoginStatus.value } : 
                await getCheckLogin();
            
            if (!response.success) {
                toast.add({
                    severity: "error",
                    summary: t("common.error"),
                    detail: t("userLogin.toast.notLoggedIn"),
                    life: 2000,
                });
                router.push(
                    `/user/login?redirect=${encodeURIComponent(route.fullPath)}`,
                );
                return;
            }
            if (requiredRole) {
                if (Array.isArray(requiredRole)) {
                    if (!requiredRole.includes(response.data.role)) {
                        toast.add({
                            severity: "error",
                            summary: t("common.error"),
                            detail: t("userLogin.toast.noPermission"),
                            life: 2000,
                        });
                        router.push("/");
                    }
                    return;
                } else if (response.data.role !== requiredRole) {
                    toast.add({
                        severity: "error",
                        summary: t("common.error"),
                        detail: t("userLogin.toast.noPermission"),
                        life: 2000,
                    });
                    router.push("/");
                }
            }
        } else {
            let response = cachedLoginStatus.value ? 
                { success: true, data: cachedLoginStatus.value } : 
                await getCheckLogin();
            
            if (response.success) {
                triggerLoginUpdate();
                toast.add({
                    severity: "error",
                    summary: t("common.error"),
                    detail: t("userLogin.toast.alreadyLoggedIn"),
                    life: 2000,
                });
                router.push(redirect || "/");
            }
        }
    };

    onMounted(async () => {
        startGlobalLoginScheduler();
        await checkLoginStatus();
    });

    onUnmounted(() => {
        stopGlobalLoginScheduler();
    });

    watch(loginEvent, async () => {
        if (watchLoginEvent === false) return;
        await checkLoginStatus();
    });
    
    return {
        checkLoginStatus
    };
}
