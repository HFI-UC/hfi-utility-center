<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import { postReservation, type ReservationInfo } from "../api";
import { computed, ref, Ref } from "vue";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";

const data: Ref<ReservationInfo | null> = ref(null);
const queried = ref(false);
const query = ref("");
const date: Ref<Date | null> = ref(null);
const room = ref("");
const options = ref(["Keyword", "Time", "Room"]);
const rooms = ref([
    "iStudy Meeting Room 1",
    "iStudy Meeting Room 2",
    "606",
    "605",
    "603",
    "602",
    "601",
    "206",
    "105",
    "Writing Center 1",
    "Writing Center 2",
    "512",
    "513",
    "514",
    "524",
]);

const roomMappingToNumber: { [key: string]: number } = {
    "iStudy Meeting Room 1": 101,
    "iStudy Meeting Room 2": 102,
    "Writing Center 1": 103,
    "Writing Center 2": 106,
};

const searchOption = ref("Keyword");

const onSearch = () => {
    queried.value = true;
    if (searchOption.value == "Time") {
        if (date.value) {
            date.value.setSeconds(0, 0);
            postReservation({ time: date.value }).then((res) => {
                data.value = res;
            });
        } else {
            data.value = { success: false, data: [] };
        }
    } else if (searchOption.value == "Room") {
        if (room.value == "") {
            data.value = { success: false, data: [] };
            return;
        }
        postReservation({
            room: (roomMappingToNumber[room.value] || room.value).toString(),
        }).then((res) => {
            data.value = res;
        });
    } else {
        if (query.value == "") {
            data.value = { success: false, data: [] };
            return;
        }
        postReservation({ query: query.value }).then((res) => {
            data.value = res;
        });
    }
};

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
        reason: string;
        severity: string;
    }[] = [];
    for (const item of data.value.data) {
        booking.push({
            name: item.name,
            email: item.email,
            time: formatTime(item.time),
            date: formatDate(item.time),
            room: roomMappingToString[item.room] || item.room.toString(),
            status: statusMapping[item.auth],
            reason: item.reason,
            severity: getSeverity(item.auth),
        });
    }
    booking.sort((a, b) =>
        a.date === b.date
            ? b.time.localeCompare(a.time)
            : b.date.localeCompare(a.date),
    );
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

const roomMappingToString: { [key: number]: string } = {
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
            <p
                v-if="
                    ((searchOption == 'Keyword' && query !== '') ||
                        (searchOption == 'Time' && data)) &&
                    data?.data.length == 0 &&
                    queried
                "
            >
                No available data.
            </p>
            <p v-else>Enter a keyword to start your search.</p>
        </template>
        <template #header>
            <div class="flex flex-col gap-3">
                <SelectButton
                    v-model="searchOption"
                    class="h-[40px]"
                    :options="options"
                    aria-labelledby="basic"
                />
                <div class="flex justify-start gap-3">
                    <Select
                        v-if="searchOption == 'Room'"
                        v-model="room"
                        v-tooltip.bottom="'Search with room.'"
                        placeholder="Room"
                        :options="rooms"
                    />
                    <DatePicker
                        v-else-if="searchOption == 'Time'"
                        showTime
                        v-tooltip.bottom="
                            'Search with time. The search will show results before and after three hours.'
                        "
                        v-model="date"
                        placeholder="Time"
                        dateFormat="yy/mm/dd"
                    />
                    <InputText
                        v-else
                        v-model="query"
                        v-tooltip.bottom="'Search with keyword.'"
                        placeholder="Keyword"
                    />
                    <Button
                        @click="onSearch()"
                        label="Search"
                        icon="pi pi-search"
                    ></Button>
                </div>
            </div>
        </template>
        <Column field="name" header="Name / Class"></Column>
        <Column field="email" header="E-mail"></Column>
        <Column field="date" header="Date"></Column>
        <Column field="time" header="Time"></Column>
        <Column field="room" header="Room"></Column>
        <Column field="reason" header="Reason"></Column>
        <Column field="status" header="Status">
            <template #body="{ data }">
                <Tag :severity="data.severity" :value="data.status"></Tag>
            </template>
        </Column>
    </DataTable>
</template>

<style scoped>
.p-inputtext,
.p-datepicker,
.p-select,
input {
    min-width: 15rem;
}
@media screen and (max-width: 720px) {
    .p-inputtext,
    .p-datepicker,
    .p-select,
    input {
        min-width: 10rem;
    }
}
</style>
