<script setup lang="ts">
import { onMounted } from "vue";
import { getCheckLogin } from "../api";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";

const { t } = useI18n()
const props = defineProps<{ requireLogin: boolean; redirect?: string }>();
const toast = useToast();
onMounted(async () => {
    if (props.requireLogin) {
        const response = await getCheckLogin();
        if (!response.success) {
            toast.add({
                severity: "error",
                summary: t("toast.error"),
                detail: t("toast.details.alreadyLoggedIn"),
                life: 2000,
            });
            setTimeout(
                () =>
                    (window.location.href = `/admin/login/?redirect=${encodeURIComponent(window.location.href)}`),
                2500,
            );
        }
    } else {
        const response = await getCheckLogin();
        if (response.success) {
            toast.add({
                severity: "error",
                summary: t("toast.error"),
                detail: t("toast.details.notLoggedIn"),
                life: 2000,
            });
            setTimeout(
                () =>
                    (window.location.href =
                        props.redirect || "/admin/dashboard/"),
                2500,
            );
        }
    }
});
</script>
