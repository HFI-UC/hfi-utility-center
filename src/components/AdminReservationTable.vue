<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import { postReservation, type ReservationInfo } from "../api";
import { computed, onMounted, watch, ref, Ref } from "vue";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import { useI18n } from "vue-i18n";

const data: Ref<ReservationInfo | null> = ref(null);
const queried = ref(false);
const query = ref("");
const date: Ref<Date | null> = ref(null);
const room = ref("");
const { t, locale } = useI18n();
const options = computed(() => [
    t("status.option.keyword"),
    t("status.option.time"),
    t("status.option.room"),
]);
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
const searchOption = ref(t("status.option.keyword"));

watch(
    () => locale.value,
    () => {
        searchOption.value = t("status.option.keyword");
    },
);
const token = ref("");

const onSearch = () => {
    queried.value = true;
    if (searchOption.value == t("status.option.time")) {
        if (date.value) {
            date.value.setSeconds(0, 0);
            postReservation({ time: date.value, token: token.value }).then(
                (res) => {
                    data.value = res;
                },
            );
        } else {
            data.value = { success: false, data: [] };
        }
    } else if (searchOption.value == t("status.option.room")) {
        if (room.value == "") {
            data.value = { success: false, data: [] };
            return;
        }
        postReservation({
            room: (roomMappingToNumber[room.value] || room.value).toString(),
            token: token.value,
        }).then((res) => {
            data.value = res;
        });
    } else {
        if (query.value == "") {
            data.value = { success: false, data: [] };
            return;
        }
        postReservation({ query: query.value, token: token.value }).then(
            (res) => {
                data.value = res;
            },
        );
    }
};

onMounted(() => {
    token.value = sessionStorage.getItem("token") || "";
});

const statusMapping: Ref<{ [key: string]: string }> = computed(() => ({
    non: t("status.tag.pending"),
    yes: t("status.tag.approved"),
    no: t("status.tag.rejected"),
}));

const bookingData = computed(() => {
    if (!data.value) return [];
    const booking: {
        id: string;
        sid: number;
        addTime: string;
        operator: string;
        name: string;
        email: string;
        time: string;
        date: string;
        reason: string;
        room: string;
        status: string;
        severity: string;
    }[] = [];
    for (const item of data.value.data) {
        booking.push({
            id: `#${item.id as number}`,
            sid: item.sid as number,
            addTime: item.addTime || "",
            operator: item.operator || "",
            name: item.name,
            email: item.email,
            time: formatTime(item.time),
            date: formatDate(item.time),
            reason: item.reason,
            room: roomMappingToString[item.room] || item.room.toString(),
            status: statusMapping.value[item.auth],
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
                    ((searchOption == t('status.option.keyword') &&
                        query !== '') ||
                        (searchOption == t('status.option.time') && data)) &&
                    data?.data.length == 0 &&
                    queried
                "
            >
                {{ $t("status.table.empty") }}
            </p>
            <p v-else>{{ $t("status.table.enter_keyword") }}</p>
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
                        v-if="searchOption == $t('status.option.room')"
                        v-model="room"
                        v-tooltip.bottom="$t('status.tooltip.room')"
                        :placeholder="$t('status.option.room')"
                        :options="rooms"
                    />
                    <DatePicker
                        v-else-if="searchOption == $t('status.option.time')"
                        showTime
                        v-tooltip.bottom="$t('status.tooltip.time')"
                        v-model="date"
                        :placeholder="$t('status.option.time')"
                        dateFormat="yy/mm/dd"
                    />
                    <InputText
                        v-else
                        v-model="query"
                        v-tooltip.bottom="$t('status.tooltip.keyword')"
                        :placeholder="$t('status.option.keyword')"
                    />
                    <Button
                        @click="onSearch()"
                        :label="$t('status.table.search')"
                        icon="pi pi-search"
                    ></Button>
                </div>
            </div>
        </template>
        <Column field="id" :header="$t('status.column.id')"></Column>
        <Column field="sid" :header="$t('status.column.sid')"></Column>
        <Column field="name" :header="$t('status.column.name')"></Column>
        <Column field="email" :header="$t('status.column.email')"></Column>
        <Column field="date" :header="$t('status.column.date')"></Column>
        <Column field="time" :header="$t('status.column.time')"></Column>
        <Column field="room" :header="$t('status.column.room')"></Column>
        <Column field="reason" :header="$t('status.column.name')"></Column>
        <Column
            field="operator"
            :header="$t('status.column.operator')"
        ></Column>
        <Column field="addTime" :header="$t('status.column.add_time')"></Column>
        <Column field="status" :header="$t('status.column.status')">
            <template #body="{ data }">
                <Tag :severity="data.severity" :value="data.status"></Tag>
            </template>
        </Column>
    </DataTable>
</template>

<style scoped>
:deep(.p-inputtext),
.p-select {
    min-width: 15rem;
    border-radius: 0.5rem !important;
}

button {
    border-radius: 0.5rem;
}
@media screen and (max-width: 720px) {
    :deep(.p-inputtext),
    .p-select {
        min-width: 10rem;
    }
}
</style>
