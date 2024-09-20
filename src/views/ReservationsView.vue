<script setup lang="ts">
import ReservationForm from "../components/ReservationForm.vue";
import { ref } from "vue";
import Timeline from "primevue/timeline";

const events = ref([
    { icon: "pi pi-pen-to-square", color: "blue" },
    { icon: "pi pi-cog", color: "grey" },
    { icon: "pi pi-check", color: "grey" },
]);
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <div class="card flex flex-col justify-center" id="timeline">
            <Timeline :value="events" layout="horizontal" align="top">
                <template #marker="slotProps">
                    <span
                        class="flex w-8 h-8 items-center justify-center text-white rounded-full shadow-sm"
                        :style="{
                            backgroundColor: slotProps.item.color,
                        }"
                    >
                        <i :class="slotProps.item.icon"></i>
                    </span>
                </template>
            </Timeline>
        </div>
    </div>
    <ReservationForm />
</template>

<style scoped>
:deep(.p-timeline-event-connector) {
    width: 50% !important;
}
#timeline {
    width: 18rem;
}
</style>
