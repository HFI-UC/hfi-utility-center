<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import { postReservation, type ReservationInfo } from "../api";
import { computed, ref, watch, Ref } from "vue";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";

const data: Ref<ReservationInfo | null> = ref(null)

const query = ref("")

watch(
    () => query.value,
    (newValue) => {
        postReservation(newValue)
        .then((res) => {
            data.value = res
        })
    }
)

const statusMapping: { [key: string]: string } = {
    non: "Pending",
    yes: "Approved",
    no: "Rejected",
};

const bookingData = computed(() => {
    if (!data.value) return [];
    const booking: {
        name: string;
        email: string;
        time: string;
        date: string;
        room: string;
        status: string;
        severity: string;
    }[] = [];
    for (const item of data.value.data) {
        booking.push({
            name: item.name,
            email: item.email,
            time: formatTime(item.time),
            date: formatDate(item.time),
            room: roomMapping[item.room] || item.room.toString(),
            status: statusMapping[item.auth],
            severity: getSeverity(item.auth),
        });
    }
    booking.sort((a, b) => {
        if (a.room === b.room) {
            return a.time.localeCompare(b.time);
        } else {
            return a.room.localeCompare(b.room);
        }
    });
    return booking;
});

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

const getSeverity = (label: string): string => {
    switch (label) {
        case "non":
            return "info";
        case "no":
            return "danger";
        case "yes":
            return "success";
        default:
            return "info";
    }
};
</script>

<template>
    <DataTable
        :value="bookingData"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
    >
        <template #empty>
            <p v-if="query !== ''">No available data.</p>
            <p v-else>Enter a keyword to start your search.</p>
        </template>
        <template #header>
            <div class="flex justify-start">
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText
                        v-model="query"
                        placeholder="Keyword Search"
                    />
                </IconField>
            </div>
        </template>
        <Column field="name" header="Name"></Column>
        <Column field="email" header="E-mail"></Column>
        <Column field="date" header="Date"></Column>
        <Column field="time" header="Time"></Column>
        <Column field="room" header="Room"></Column>
        <Column field="status" header="Status">
            <template #body="{ data }">
                <Tag :severity="data.severity" :value="data.status"></Tag>
            </template>
        </Column>
    </DataTable>
</template>
