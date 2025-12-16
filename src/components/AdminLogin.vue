<script setup lang="ts">
import { onMounted } from "vue";
import { getCheckLogin } from "../api";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";

const { t } = useI18n()
const props = defineProps<{ requireLogin: boolean; redirect?: string }>();
const toast = useToast();
const router = useRouter();
const route = useRoute();

onMounted(async () => {
    if (props.requireLogin) {
        const response = await getCheckLogin();
        if (!response.success) {
            toast.add({
                severity: "error",
                summary: t("common.error"),
                detail: t("adminLogin.toast.notLoggedIn"),
                life: 2000,
            });
            setTimeout(
                () =>
                    router.push(`/admin/login?redirect=${encodeURIComponent(route.fullPath)}`),
                2500,
            );
        }
    } else {
        const response = await getCheckLogin();
        if (response.success) {
            toast.add({
                severity: "error",
                summary: t("common.error"),
                detail: t("adminLogin.toast.alreadyLoggedIn"),
                life: 2000,
            });
            setTimeout(
                () =>
                    router.push(props.redirect || "/admin/dashboard"),
                2500,
            );
        }
    }
});
</script>
