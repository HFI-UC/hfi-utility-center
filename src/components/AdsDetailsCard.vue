<script setup lang="ts">
import type { Advertisement } from "@/api";

const props = defineProps<{
    data: Advertisement;
    buttons?: { label: string; action: () => void; iconComponent: any; severity?: string }[]
}>();

const statusSeverityMapping = {
    active: "success",
    "payment-pending": "warning",
    expired: "danger",
    pending: "info",
    rejected: "danger",
};

const statusLabelMapping = {
    active: "Active",
    "payment-pending": "Payment Pending",
    expired: "Expired",
    pending: "Pending Approval",
    rejected: "Rejected",
};
</script>

<template>
    <Card>
        <template #content>
            <h2 class="font-bold text-xl mb-4">Ad #{{ data.id }}</h2>
            <Galleria
                :value="data.images"
                :showThumbnails="false"
                :showIndicators="true"
                :changeItemOnIndicatorHover="true"
                containerClass="w-full"
            >
                <template #header>
                    <Tag class="mt-4 ms-4 mb-4" :severity="statusSeverityMapping[data.status]">{{ statusLabelMapping[data.status] }}</Tag>
                </template>
                <template #item="slotProps">
                    <div class="w-full h-100">
                        <img :src="slotProps.item" class="w-full h-full object-contain block" />
                    </div>
                </template>
            </Galleria>
            <h3 class="font-semibold text-lg mt-4">{{ data.title }}</h3>
            <div class="grid gap-2 grid-cols-2 mt-4" v-if="buttons && buttons.length">
                <Button
                    v-for="button in buttons"
                    :key="button.label"
                    @click="button.action"
                    size="small"
                    :severity="button.severity || 'primary'"
                    fluid
                    class="col-span-2 md:col-span-1"
                    ><component :is="button.iconComponent" />
                    {{ button.label }}</Button
                >
            </div>
        </template>
    </Card>
</template>
