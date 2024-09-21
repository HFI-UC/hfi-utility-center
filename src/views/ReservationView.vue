<script setup lang="ts">
import ReservationTable from "../components/ReservationTable.vue";
import Card from "primevue/card";
</script>

<template>
    <h1>Reservation Status</h1>
    <Card>
        <template #content>
            <ReservationTable />
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
