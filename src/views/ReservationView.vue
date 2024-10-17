<script setup lang="ts">
import ReservationTable from "../components/ReservationTable.vue";
import AdminReservationTable from "../components/AdminReservationTable.vue";
import Card from "primevue/card";
import { ref, onMounted } from "vue";
import { verifyAdmin } from "../api";

const isAdmin = ref(false);
const token = ref("");
onMounted(async () => {
    token.value = sessionStorage.getItem("token") || "";
    if (
        !token.value ||
        !(await verifyAdmin(token.value))
    ) {
        isAdmin.value = false;
    } else {
        isAdmin.value = true;
    }
});
</script>

<template>
    <h1>Reservation Status</h1>
    <Card>
        <template #content>
            <ReservationTable v-if="!isAdmin" />
            <AdminReservationTable v-else />
        </template>
    </Card>
</template>

<style scoped>
h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}
</style>
