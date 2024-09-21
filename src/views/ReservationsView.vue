<script setup lang="ts">
import ReservationForm from "../components/ReservationForm.vue";
import ReservationStatus from "../components/ReservationStatus.vue";
import { computed } from "vue";
import Timeline from "primevue/timeline";


const props = defineProps<{
    status?: string
    message?: string
}>()

const events = computed(() => {
    let items = [{ icon: "pi pi-pen-to-square", color: "var(--p-violet-700)" },
    { icon: "pi pi-check", color: "grey" }]
    if (props.status == "success") items[1].color = "var(--p-green-500)", items[1].icon = "pi pi-check"
    else if (props.status == "failed") items[1].color = "var(--p-red-500)", items[1].icon = "pi pi-exclamation-triangle"
    return items
});

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
    <ReservationForm v-if="!props.status"/>
    <ReservationStatus v-else :status="props.status" :message="props.message"/>
</template>

<style scoped>
:deep(.p-timeline-event-connector) {
    width: 5% !important;
}
#timeline {
    width: 18rem;
}
</style>
