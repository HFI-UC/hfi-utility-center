<script setup lang="ts">
import DataTable from "primevue/datatable";
import Skeleton from "primevue/skeleton";
import Column from "primevue/column";
import Tag from "primevue/tag";
import { ReservationInfo } from "../api";
import { fetchReservation } from "../api";
import { useRequest } from "vue-request";
import { computed } from "vue";

const { data } = useRequest(
    (): Promise<ReservationInfo> => fetchReservation(),
    { pollingInterval: 1000000 },
);

const bookingData = computed(() => data.value?.data || []);

const formatDate = (time: string) => {
    const startTime = time.split("-")[0];
    const date = new Date(parseInt(startTime));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatTime = (time: string) => {
    const [start, end] = time.split("-");
    const startTime = new Date(parseInt(start));
    const endTime = new Date(parseInt(end));
    const formatHour = (date: Date): string =>
        `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${formatHour(startTime)} ~ ${formatHour(endTime)}`;
};

const roomMapping: { [key: number]: string } = {
    101: "iStudy Meeting Room 1",
    102: "iStudy Meeting Room 2",
    103: "Writing Center 1",
    106: "Writing Center 2",
};

const getSeverity = (label: string) => {
    switch (label) {
        case "non":
            return "info";
        case "no":
            return "danger";
        case "yes":
            return "success";
    }
};

const statusMapping: { [key: string]: string } = {
    non: "Pending",
    yes: "Approved",
    no: "Rejected",
};
</script>

<template>
    <DataTable
        v-if="data"
        :value="bookingData"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
    >
        <template #header> </template>
        <Column field="name" header="Name"></Column>
        <Column field="email" header="E-mail"></Column>
        <Column field="date" header="Date">
            <template #body="slotProps">
                {{ formatDate(slotProps.data.time) }}
            </template>
        </Column>
        <Column field="time" header="Time">
            <template #body="slotProps">
                {{ formatTime(slotProps.data.time) }}
            </template>
        </Column>
        <Column field="room" header="Room">
            <template #body="slotProps">
                {{
                    roomMapping[slotProps.data.room] ||
                    slotProps.data.room.toString()
                }}
            </template>
        </Column>
        <Column field="status" header="Status">
            <template #body="slotProps">
                <Tag
                    :severity="getSeverity(slotProps.data.auth)"
                    :value="statusMapping[slotProps.data.auth]"
                ></Tag>
            </template>
        </Column>
    </DataTable>
    <Skeleton v-else height="650px"></Skeleton>
</template>
