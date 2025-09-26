<script setup lang="ts">
import { onMounted } from "vue";
import { getCheckLogin } from "../api";
import { useToast } from "primevue";

const props = defineProps<{ requireLogin: boolean; redirect?: string }>();
const toast = useToast();
onMounted(async () => {
    if (props.requireLogin) {
        const response = await getCheckLogin();
        if (!response.success) {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: "You must be logged in to access this page.",
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
                summary: "Error",
                detail: "You have already logged in! Redirecting...",
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
<template>
    <Toast></Toast>
</template>
