<script setup lang="ts">
import { onMounted, watch } from "vue";
import { getCheckLogin } from "../api";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { triggerLoginUpdate, useLoginEvent } from "@/eventBus";

const { t } = useI18n();
const props = defineProps<{ requireLogin: boolean; redirect?: string; requiredRole?: "admin" | "approver" | "student" | string[] }>();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const loginEvent = useLoginEvent()
const checkLoginStatus = async () => {
    if (props.requireLogin) {
        const response = await getCheckLogin();
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
        }
        if (props.requiredRole) {
            if (Array.isArray(props.requiredRole)) {
                if (!props.requiredRole.includes(response.data.role)) {
                    toast.add({
                        severity: "error",
                        summary: t("common.error"),
                        detail: t("userLogin.toast.noPermission"),
                        life: 2000,
                    });
                    router.push("/");
                }
                return;
            }
            else if (response.data.role !== props.requiredRole) {
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
        const response = await getCheckLogin();
        if (response.success) {
            triggerLoginUpdate();
            toast.add({
                severity: "error",
                summary: t("common.error"),
                detail: t("userLogin.toast.alreadyLoggedIn"),
                life: 2000,
            });
            router.push(props.redirect || "/");
        }
    }
};

onMounted(async () => {
    await checkLoginStatus();
});

watch(loginEvent, async () => {
    await checkLoginStatus();
});
</script>
